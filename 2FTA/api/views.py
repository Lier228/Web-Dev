from collections import defaultdict
from datetime import date, timedelta
from decimal import Decimal
from math import ceil
from uuid import uuid4

from django.db import transaction
from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken, TokenError

from .models import Exercise, ExerciseSet, LastSet, Session
from .serializers import (
    ExerciseSerializer,
    ExerciseSetSerializer,
    LastSetSerializer,
    LoginSerializer,
    MuscleGroupSerializer,
    RegisterSerializer,
    SessionHistoryQuerySerializer,
    SessionExerciseItemCreateSerializer,
    SessionExerciseItemSerializer,
    SessionSerializer,
    StatsQuerySerializer,
    UserProfileSerializer,
    build_muscle_group_payload,
)


def build_auth_response(user):
    refresh = RefreshToken.for_user(user)
    return {
        'access': str(refresh.access_token),
        'refresh': str(refresh),
        'user': {
            'id': user.id,
            'username': user.username,
        },
    }


def active_session_for(user):
    return Session.objects.filter(user=user, finish_time__isnull=True).order_by('-start_time').first()


def list_muscle_groups():
    return [build_muscle_group_payload(code) for code, _ in Exercise.MuscleGroup.choices]


def batch_payload(exercise_sets):
    items = list(exercise_sets)
    if not items:
        return None

    first = items[0]
    total_points = sum(item.points for item in items)
    return {
        'id': first.id,
        'session': first.session_id,
        'exercise': first.exercise_id,
        'exercise_name': first.exercise.name,
        'sets': len(items),
        'reps': first.reps,
        'weight_kg': f'{Decimal(first.weight_kg):.2f}',
        'points': f'{Decimal(total_points):.2f}',
        'notes': first.notes,
        'created_at': first.created_at,
    }


def grouped_exercise_items(queryset):
    grouped = defaultdict(list)
    ordered = queryset.select_related('exercise', 'session').order_by('-created_at', '-id')
    for exercise_set in ordered:
        grouped[str(exercise_set.batch_id)].append(exercise_set)

    items = [batch_payload(sets) for sets in grouped.values()]
    items = [item for item in items if item is not None]
    items.sort(key=lambda item: item['created_at'], reverse=True)
    return items


def serialize_decimal(value) -> float:
    return float(Decimal(value).quantize(Decimal('0.01')))


def duration_seconds(duration) -> int:
    return int(duration.total_seconds()) if duration else 0


def resolve_stats_dates(validated_data):
    period = validated_data.get('period', 'all')
    today = date.today()

    if period == 'week':
        start_date = today - timedelta(days=6)
        end_date = today
    elif period == 'month':
        start_date = today - timedelta(days=29)
        end_date = today
    elif period == 'quarter':
        start_date = today - timedelta(days=89)
        end_date = today
    elif period == 'custom':
        start_date = validated_data['date_from']
        end_date = validated_data['date_to']
    else:
        start_date = validated_data.get('date_from')
        end_date = validated_data.get('date_to')

    return start_date, end_date


def session_history_item_payload(session):
    sets = list(session.exercise_sets.all())
    exercise_ids = set()
    item_batches = set()
    muscle_map = defaultdict(lambda: {'points': 0, 'total_sets': 0, 'total_volume': Decimal('0.00')})
    exercise_map = defaultdict(lambda: {'name': '', 'total_sets': 0, 'points': 0, 'total_volume': Decimal('0.00')})
    total_volume = Decimal('0.00')
    total_weight = Decimal('0.00')

    for exercise_set in sets:
        exercise_ids.add(exercise_set.exercise_id)
        item_batches.add(str(exercise_set.batch_id))
        volume = Decimal(exercise_set.weight_kg) * exercise_set.reps
        total_volume += volume
        total_weight += Decimal(exercise_set.weight_kg)

        muscle_bucket = muscle_map[exercise_set.exercise.target_muscle]
        muscle_bucket['points'] += int(exercise_set.points)
        muscle_bucket['total_sets'] += 1
        muscle_bucket['total_volume'] += volume

        exercise_bucket = exercise_map[exercise_set.exercise_id]
        exercise_bucket['name'] = exercise_set.exercise.name
        exercise_bucket['points'] += int(exercise_set.points)
        exercise_bucket['total_sets'] += 1
        exercise_bucket['total_volume'] += volume

    muscle_breakdown = [
        {
            'code': code,
            'muscle': dict(Exercise.MuscleGroup.choices).get(code, code.replace('_', ' ').title()),
            'points': values['points'],
            'total_sets': values['total_sets'],
            'total_volume': serialize_decimal(values['total_volume']),
        }
        for code, values in muscle_map.items()
    ]
    muscle_breakdown.sort(key=lambda item: (-item['points'], item['muscle']))

    top_exercises = [
        {
            'exercise_id': exercise_id,
            'name': values['name'],
            'points': values['points'],
            'total_sets': values['total_sets'],
            'total_volume': serialize_decimal(values['total_volume']),
        }
        for exercise_id, values in exercise_map.items()
    ]
    top_exercises.sort(key=lambda item: (-item['points'], item['name']))

    return {
        'id': session.id,
        'date': session.date.isoformat(),
        'start_time': session.start_time,
        'finish_time': session.finish_time,
        'duration': str(session.duration) if session.duration else None,
        'duration_seconds': duration_seconds(session.duration),
        'status': session.status,
        'points_sum': int(session.points_sum or 0),
        'total_sets': len(sets),
        'exercise_count': len(exercise_ids),
        'logged_items': len(item_batches),
        'total_volume': serialize_decimal(total_volume),
        'average_weight': serialize_decimal(total_weight / len(sets)) if sets else 0.0,
        'muscle_breakdown': muscle_breakdown,
        'top_exercises': top_exercises[:5],
    }


def build_stats_payload(user, validated_data):
    interval = validated_data.get('interval', 'week')
    start_date, end_date = resolve_stats_dates(validated_data)

    sessions_qs = Session.objects.filter(user=user)
    sets_qs = ExerciseSet.objects.select_related('exercise', 'session').filter(session__user=user)
    if start_date:
        sessions_qs = sessions_qs.filter(date__gte=start_date)
        sets_qs = sets_qs.filter(session__date__gte=start_date)
    if end_date:
        sessions_qs = sessions_qs.filter(date__lte=end_date)
        sets_qs = sets_qs.filter(session__date__lte=end_date)

    sessions = list(sessions_qs.order_by('-date', '-start_time'))
    sets = list(sets_qs.order_by('session__date', 'created_at', 'id'))

    total_points = sum(int(session.points_sum or 0) for session in sessions)
    total_sets = len(sets)
    total_reps = sum(exercise_set.reps for exercise_set in sets)
    total_volume = Decimal('0.00')
    total_weight = Decimal('0.00')
    durations = [duration_seconds(session.duration) for session in sessions if session.duration]
    completed_sessions = sum(1 for session in sessions if session.finish_time)
    active_sessions = len(sessions) - completed_sessions

    points_by_muscle = defaultdict(int)
    muscle_counts = defaultdict(int)
    muscle_breakdown = defaultdict(lambda: {'points': 0, 'total_sets': 0, 'total_volume': Decimal('0.00')})
    exercise_breakdown = defaultdict(lambda: {'name': '', 'points': 0, 'total_sets': 0, 'total_volume': Decimal('0.00')})
    trend_points = defaultdict(int)
    trend_volume = defaultdict(lambda: Decimal('0.00'))

    for exercise_set in sets:
        volume = Decimal(exercise_set.weight_kg) * exercise_set.reps
        total_volume += volume
        total_weight += Decimal(exercise_set.weight_kg)

        muscle_code = exercise_set.exercise.target_muscle
        points_by_muscle[muscle_code] += int(exercise_set.points)
        muscle_counts[muscle_code] += 1

        muscle_entry = muscle_breakdown[muscle_code]
        muscle_entry['points'] += int(exercise_set.points)
        muscle_entry['total_sets'] += 1
        muscle_entry['total_volume'] += volume

        exercise_entry = exercise_breakdown[exercise_set.exercise_id]
        exercise_entry['name'] = exercise_set.exercise.name
        exercise_entry['points'] += int(exercise_set.points)
        exercise_entry['total_sets'] += 1
        exercise_entry['total_volume'] += volume

        bucket_day = exercise_set.session.date
        if interval == 'day':
            bucket_key = bucket_day.isoformat()
        else:
            week_start = bucket_day - timedelta(days=bucket_day.weekday())
            bucket_key = week_start.isoformat()
        trend_points[bucket_key] += int(exercise_set.points)
        trend_volume[bucket_key] += volume

    favorite_muscle_code = None
    if muscle_counts:
        favorite_muscle_code = max(muscle_counts.items(), key=lambda item: (item[1], points_by_muscle[item[0]]))[0]

    top_exercises = [
        {
            'exercise_id': exercise_id,
            'name': values['name'],
            'points': values['points'],
            'total_sets': values['total_sets'],
            'total_volume': serialize_decimal(values['total_volume']),
        }
        for exercise_id, values in exercise_breakdown.items()
    ]
    top_exercises.sort(key=lambda item: (-item['points'], item['name']))

    muscle_distribution = [
        {
            'code': code,
            'muscle': dict(Exercise.MuscleGroup.choices).get(code, code.replace('_', ' ').title()),
            'points': values['points'],
            'total_sets': values['total_sets'],
            'total_volume': serialize_decimal(values['total_volume']),
        }
        for code, values in muscle_breakdown.items()
    ]
    muscle_distribution.sort(key=lambda item: (-item['points'], item['muscle']))

    sorted_buckets = sorted(trend_points.keys())
    time_series = [
        {
            'bucket_start': bucket,
            'points': trend_points[bucket],
            'volume': serialize_decimal(trend_volume[bucket]),
        }
        for bucket in sorted_buckets
    ]

    if interval == 'day':
        points_over_time = [{'date': item['bucket_start'], 'points': item['points']} for item in time_series]
    else:
        points_over_time = [{'week_start': item['bucket_start'], 'points': item['points']} for item in time_series]

    session_dates = sorted({session.date for session in sessions})
    current_streak = 0
    longest_streak = 0
    previous_day = None
    for session_day in session_dates:
        if previous_day and session_day == previous_day + timedelta(days=1):
            current_streak += 1
        else:
            current_streak = 1
        longest_streak = max(longest_streak, current_streak)
        previous_day = session_day
    if session_dates and session_dates[-1] != date.today():
        current_streak = 0

    best_session = None
    if sessions:
        top_session = max(sessions, key=lambda session: (int(session.points_sum or 0), session.start_time))
        best_session = {
            'id': top_session.id,
            'date': top_session.date.isoformat(),
            'points_sum': int(top_session.points_sum or 0),
            'status': top_session.status,
        }

    total_duration_seconds = sum(durations)
    total_duration = str(timedelta(seconds=total_duration_seconds)) if total_duration_seconds else None

    return {
        'period': validated_data.get('period', 'all'),
        'date_from': start_date.isoformat() if start_date else None,
        'date_to': end_date.isoformat() if end_date else None,
        'interval': interval,
        'total_sessions': len(sessions),
        'completed_sessions': completed_sessions,
        'active_sessions': active_sessions,
        'total_points': total_points,
        'total_sets': total_sets,
        'total_reps': total_reps,
        'total_volume': serialize_decimal(total_volume),
        'average_weight': serialize_decimal(total_weight / total_sets) if total_sets else 0.0,
        'average_points_per_session': round(total_points / len(sessions), 2) if sessions else 0.0,
        'total_duration': total_duration,
        'total_duration_seconds': total_duration_seconds,
        'average_session_duration_seconds': round(total_duration_seconds / completed_sessions, 2) if completed_sessions else 0.0,
        'favorite_muscle': favorite_muscle_code or 'N/A',
        'favorite_muscle_label': (
            dict(Exercise.MuscleGroup.choices).get(favorite_muscle_code, favorite_muscle_code.replace('_', ' ').title())
            if favorite_muscle_code
            else 'N/A'
        ),
        'points_by_muscle': dict(sorted(points_by_muscle.items())),
        'muscle_breakdown': muscle_distribution,
        'points_over_time': points_over_time,
        'time_series': time_series,
        'top_exercises': top_exercises[:5],
        'best_session': best_session,
        'recent_sessions': [
            {
                'id': session.id,
                'date': session.date.isoformat(),
                'status': session.status,
                'points_sum': int(session.points_sum or 0),
                'duration_seconds': duration_seconds(session.duration),
            }
            for session in sessions[:5]
        ],
        'streaks': {
            'current_days': current_streak,
            'longest_days': longest_streak,
        },
    }


@api_view(['POST'])
@permission_classes([AllowAny])
def register_view(request):
    serializer = RegisterSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    user = serializer.save()
    return Response({'id': user.id, 'username': user.username}, status=status.HTTP_201_CREATED)


@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    serializer = LoginSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    user = serializer.validated_data['user']
    return Response(build_auth_response(user))


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout_view(request):
    refresh_token = request.data.get('refresh')
    if not refresh_token:
        return Response({'detail': 'Refresh token is required.'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        RefreshToken(refresh_token).blacklist()
    except TokenError:
        return Response({'detail': 'Invalid refresh token.'}, status=status.HTTP_400_BAD_REQUEST)

    return Response({'detail': 'Logged out.'})


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def muscle_group_list_view(request):
    serializer = MuscleGroupSerializer(list_muscle_groups(), many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def stats_view(request):
    serializer = StatsQuerySerializer(data=request.query_params)
    serializer.is_valid(raise_exception=True)
    return Response(build_stats_payload(request.user, serializer.validated_data))


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def weekly_stats_view(request):
    payload = build_stats_payload(request.user, {'period': 'week', 'interval': 'day'})
    start_date = date.today() - timedelta(days=6)
    end_date = date.today()
    points_lookup = {item['date']: item['points'] for item in payload['points_over_time']}
    line_chart = []
    for offset in range(7):
        day = start_date + timedelta(days=offset)
        line_chart.append({
            'date': day.isoformat(),
            'points': int(points_lookup.get(day.isoformat(), 0) or 0),
        })

    return Response({
        'period': 'week',
        'date_from': start_date.isoformat(),
        'date_to': end_date.isoformat(),
        'total_sessions': payload['total_sessions'],
        'total_points': int(payload['total_points']),
        'total_sets': payload['total_sets'],
        'total_volume': payload['total_volume'],
        'average_weight': payload['average_weight'],
        'line_chart': line_chart,
        'muscle_distribution': [
            {'muscle': item['muscle'], 'points': item['points']}
            for item in payload['muscle_breakdown']
        ],
        'top_exercises': payload['top_exercises'][:3],
    })


class UserProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = UserProfileSerializer(request.user, context={'request': request})
        return Response(serializer.data)

    def patch(self, request):
        serializer = UserProfileSerializer(request.user, data=request.data, partial=True, context={'request': request})
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)


class ExerciseListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        muscle = request.query_params.get('muscle')
        queryset = Exercise.objects.filter(is_active=True)
        if muscle:
            queryset = queryset.filter(target_muscle=muscle)
        serializer = ExerciseSerializer(queryset.order_by('name'), many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = ExerciseSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class ExerciseDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get_object(self, pk):
        return get_object_or_404(Exercise, pk=pk)

    def get(self, request, pk):
        serializer = ExerciseSerializer(self.get_object(pk))
        return Response(serializer.data)

    def put(self, request, pk):
        exercise = self.get_object(pk)
        serializer = ExerciseSerializer(exercise, data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

    def patch(self, request, pk):
        exercise = self.get_object(pk)
        serializer = ExerciseSerializer(exercise, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

    def delete(self, request, pk):
        exercise = self.get_object(pk)
        exercise.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class StartSessionView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        active_session = active_session_for(request.user)
        if active_session:
            return Response(SessionSerializer(active_session).data)

        session = Session.objects.create(user=request.user)
        return Response(SessionSerializer(session).data, status=status.HTTP_201_CREATED)


class CurrentSessionView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        active_session = active_session_for(request.user)
        if not active_session:
            return Response({'detail': 'No active session'}, status=status.HTTP_404_NOT_FOUND)
        return Response(SessionSerializer(active_session).data)


class SessionHistoryView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = SessionHistoryQuerySerializer(data=request.query_params)
        serializer.is_valid(raise_exception=True)
        params = serializer.validated_data

        queryset = Session.objects.filter(user=request.user)
        if params['status'] == 'in_progress':
            queryset = queryset.filter(finish_time__isnull=True)
        elif params['status'] == 'completed':
            queryset = queryset.filter(finish_time__isnull=False)

        if params.get('date_from'):
            queryset = queryset.filter(date__gte=params['date_from'])
        if params.get('date_to'):
            queryset = queryset.filter(date__lte=params['date_to'])

        ordering = params['ordering']
        if ordering == 'oldest':
            queryset = queryset.order_by('date', 'start_time')
        elif ordering == 'points':
            queryset = queryset.order_by('-points_sum', '-date', '-start_time')
        else:
            queryset = queryset.order_by('-date', '-start_time')

        total_items = queryset.count()
        page = params['page']
        page_size = params['page_size']
        offset = (page - 1) * page_size
        total_pages = ceil(total_items / page_size) if total_items else 0

        summary_sessions = list(queryset)
        summary = {
            'total_sessions': total_items,
            'completed_sessions': sum(1 for session in summary_sessions if session.finish_time),
            'active_sessions': sum(1 for session in summary_sessions if not session.finish_time),
            'total_points': sum(int(session.points_sum or 0) for session in summary_sessions),
            'total_duration_seconds': sum(duration_seconds(session.duration) for session in summary_sessions),
        }

        results = list(
            queryset.prefetch_related('exercise_sets__exercise')[offset:offset + page_size]
        )

        return Response({
            'filters': {
                'status': params['status'],
                'ordering': ordering,
                'date_from': params.get('date_from').isoformat() if params.get('date_from') else None,
                'date_to': params.get('date_to').isoformat() if params.get('date_to') else None,
            },
            'summary': summary,
            'pagination': {
                'page': page,
                'page_size': page_size,
                'total_items': total_items,
                'total_pages': total_pages,
                'has_previous': page > 1,
                'has_next': page < total_pages,
            },
            'results': [session_history_item_payload(session) for session in results],
        })


class SessionListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        sessions = Session.objects.filter(user=request.user).order_by('-date', '-start_time')
        return Response(SessionSerializer(sessions, many=True).data)

    def post(self, request):
        serializer = SessionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        session = Session.objects.create(user=request.user)
        return Response(SessionSerializer(session).data, status=status.HTTP_201_CREATED)


class SessionDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get_own_session(self, pk, user):
        return get_object_or_404(Session, pk=pk, user=user)

    def get(self, request, pk):
        session = self.get_own_session(pk, request.user)
        return Response(SessionSerializer(session).data)

    def delete(self, request, pk):
        session = self.get_own_session(pk, request.user)
        session.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

    def post(self, request, pk):
        session = self.get_own_session(pk, request.user)
        if session.finish_time:
            return Response({'detail': 'Session already finished.'}, status=status.HTTP_400_BAD_REQUEST)
        session.finish()
        return Response(SessionSerializer(session).data)


class SessionExerciseItemListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        queryset = ExerciseSet.objects.filter(session__user=request.user)
        session_id = request.query_params.get('session_id')
        if session_id:
            queryset = queryset.filter(session_id=session_id)
        payload = grouped_exercise_items(queryset)
        serializer = SessionExerciseItemSerializer(payload, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = SessionExerciseItemCreateSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)

        session = serializer.validated_data['session']
        exercise = serializer.validated_data['exercise']
        sets_count = serializer.validated_data['sets']
        reps = serializer.validated_data['reps']
        weight_kg = serializer.validated_data['weight_kg']
        notes = serializer.validated_data['notes']

        created_sets = []
        with transaction.atomic():
            batch_id = uuid4()
            for _ in range(sets_count):
                exercise_set = ExerciseSet.objects.create(
                    session=session,
                    exercise=exercise,
                    batch_id=batch_id,
                    reps=reps,
                    weight_kg=weight_kg,
                    notes=notes,
                )
                created_sets.append(exercise_set)

            LastSet.objects.update_or_create(
                user=request.user,
                exercise=exercise,
                defaults={'reps': reps, 'weight_kg': weight_kg},
            )

        payload = batch_payload(created_sets)
        return Response(SessionExerciseItemSerializer(payload).data, status=status.HTTP_201_CREATED)


class SessionExerciseItemDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, pk):
        exercise_set = get_object_or_404(ExerciseSet.objects.select_related('session'), pk=pk, session__user=request.user)
        if exercise_set.session.finish_time:
            return Response({'detail': 'Cannot edit a finished session.'}, status=status.HTTP_400_BAD_REQUEST)

        batch_sets = list(
            ExerciseSet.objects.filter(
                session=exercise_set.session,
                batch_id=exercise_set.batch_id,
                session__user=request.user,
            ).order_by('-id')
        )
        for batch_item in batch_sets:
            batch_item.delete()

        return Response(status=status.HTTP_204_NO_CONTENT)


class ExerciseSetListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def get_session(self, session_pk, user):
        return get_object_or_404(Session, pk=session_pk, user=user)

    def get(self, request, session_pk):
        session = self.get_session(session_pk, request.user)
        exercise_id = request.query_params.get('exercise')
        queryset = session.exercise_sets.all()
        if exercise_id:
            queryset = queryset.filter(exercise_id=exercise_id)
        queryset = queryset.order_by('exercise', 'set_number')
        return Response(ExerciseSetSerializer(queryset, many=True).data)

    def post(self, request, session_pk):
        session = self.get_session(session_pk, request.user)
        if session.finish_time:
            return Response({'detail': 'Cannot add sets to a finished session.'}, status=status.HTTP_400_BAD_REQUEST)

        serializer = ExerciseSetSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        exercise_set = serializer.save(session=session)

        LastSet.objects.update_or_create(
            user=request.user,
            exercise=exercise_set.exercise,
            defaults={
                'reps': exercise_set.reps,
                'weight_kg': exercise_set.weight_kg,
            },
        )

        return Response(ExerciseSetSerializer(exercise_set).data, status=status.HTTP_201_CREATED)


class ExerciseSetDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get_set(self, pk, user):
        return get_object_or_404(ExerciseSet, pk=pk, session__user=user)

    def get(self, request, pk):
        exercise_set = self.get_set(pk, request.user)
        return Response(ExerciseSetSerializer(exercise_set).data)

    def patch(self, request, pk):
        exercise_set = self.get_set(pk, request.user)
        if exercise_set.session.finish_time:
            return Response({'detail': 'Cannot edit a finished session.'}, status=status.HTTP_400_BAD_REQUEST)

        serializer = ExerciseSetSerializer(exercise_set, data=request.data, partial=True, context={'request': request})
        serializer.is_valid(raise_exception=True)
        exercise_set = serializer.save()

        LastSet.objects.update_or_create(
            user=request.user,
            exercise=exercise_set.exercise,
            defaults={
                'reps': exercise_set.reps,
                'weight_kg': exercise_set.weight_kg,
            },
        )
        return Response(ExerciseSetSerializer(exercise_set).data)

    def delete(self, request, pk):
        exercise_set = self.get_set(pk, request.user)
        if exercise_set.session.finish_time:
            return Response({'detail': 'Cannot edit a finished session.'}, status=status.HTTP_400_BAD_REQUEST)
        exercise_set.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def last_set_view(request, exercise_pk):
    last = get_object_or_404(LastSet, user=request.user, exercise_id=exercise_pk)
    return Response(LastSetSerializer(last).data)

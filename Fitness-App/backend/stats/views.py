from datetime import timedelta

from django.db.models import Sum
from django.utils import timezone
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from exercises.models import MuscleGroup
from sessions.models import Session, SessionExercise

from .serializers import StatsFilterSerializer


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def weekly_stats_view(request):
    serializer = StatsFilterSerializer(data={'period': request.query_params.get('period', 'week')})
    serializer.is_valid(raise_exception=True)

    today = timezone.localdate()
    start_date = today - timedelta(days=6)
    sessions = Session.objects.filter(user=request.user, date__gte=start_date, date__lte=today)
    exercises = SessionExercise.objects.filter(session__in=sessions).select_related('exercise')

    line_data = []
    for offset in range(7):
        current_day = start_date + timedelta(days=offset)
        day_sum = sessions.filter(date=current_day).aggregate(total=Sum('points_sum'))['total'] or 0
        line_data.append({'date': current_day.strftime('%Y-%m-%d'), 'points': float(day_sum)})

    pie_data = []
    for muscle in MuscleGroup.objects.all().order_by('name'):
        total = exercises.filter(exercise__exercise_muscles__muscle_group=muscle).aggregate(total=Sum('points'))['total'] or 0
        pie_data.append({'muscle': muscle.name, 'points': float(total)})

    total_sessions = sessions.count()
    total_points = sessions.aggregate(total=Sum('points_sum'))['total'] or 0
    return Response(
        {
            'period': 'week',
            'total_sessions': total_sessions,
            'total_points': float(total_points),
            'line_chart': line_data,
            'muscle_distribution': pie_data,
        }
    )

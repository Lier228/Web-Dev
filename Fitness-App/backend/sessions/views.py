from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Session, SessionExercise
from .serializers import SessionExerciseModelSerializer, SessionModelSerializer
from .services import finish_session, recalculate_session_points


class StartSessionAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        active = Session.objects.filter(user=request.user, status='in_progress').first()
        if active:
            serializer = SessionModelSerializer(active)
            return Response(serializer.data)

        session = Session.objects.create(user=request.user)
        serializer = SessionModelSerializer(session)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class CurrentSessionAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        session = Session.objects.filter(user=request.user, status='in_progress').first()
        if not session:
            return Response({'detail': 'No active session'}, status=status.HTTP_404_NOT_FOUND)
        serializer = SessionModelSerializer(session)
        return Response(serializer.data)


class SessionExerciseListCreateAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        session_id = request.query_params.get('session_id')
        queryset = SessionExercise.objects.filter(session__user=request.user).select_related('exercise', 'session')
        if session_id:
            queryset = queryset.filter(session_id=session_id)
        serializer = SessionExerciseModelSerializer(queryset.order_by('-created_at'), many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = SessionExerciseModelSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        session = serializer.validated_data['session']
        if session.user != request.user:
            return Response({'detail': 'Forbidden'}, status=status.HTTP_403_FORBIDDEN)
        session_exercise = serializer.save()
        recalculate_session_points(session)
        return Response(SessionExerciseModelSerializer(session_exercise).data, status=status.HTTP_201_CREATED)


class SessionExerciseDetailAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get_object(self, request, pk: int) -> SessionExercise:
        return get_object_or_404(SessionExercise.objects.select_related('session', 'exercise'), pk=pk, session__user=request.user)

    def patch(self, request, pk: int):
        item = self.get_object(request, pk)
        if item.session.status != 'in_progress':
            return Response({'detail': 'Session is already completed'}, status=status.HTTP_400_BAD_REQUEST)
        serializer = SessionExerciseModelSerializer(item, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        updated = serializer.save()
        recalculate_session_points(updated.session)
        return Response(SessionExerciseModelSerializer(updated).data)

    def delete(self, request, pk: int):
        item = self.get_object(request, pk)
        session = item.session
        if session.status != 'in_progress':
            return Response({'detail': 'Session is already completed'}, status=status.HTTP_400_BAD_REQUEST)
        item.delete()
        recalculate_session_points(session)
        return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def finish_session_view(request, session_id: int):
    session = get_object_or_404(Session, id=session_id, user=request.user)
    finish_session(session)
    return Response(SessionModelSerializer(session).data)

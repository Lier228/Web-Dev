from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticatedOrReadOnly
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Exercise, MuscleGroup
from .serializers import ExerciseModelSerializer, MuscleGroupModelSerializer


@api_view(['GET'])
@permission_classes([IsAuthenticatedOrReadOnly])
def muscle_group_list(request):
    queryset = MuscleGroup.objects.all().order_by('name')
    serializer = MuscleGroupModelSerializer(queryset, many=True)
    return Response(serializer.data)


class ExerciseListCreateAPIView(APIView):
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get(self, request):
        queryset = Exercise.objects.filter(is_active=True).prefetch_related('exercise_muscles__muscle_group').order_by('name')
        muscle_code = request.query_params.get('muscle')
        if muscle_code:
            queryset = queryset.filter(exercise_muscles__muscle_group__code=muscle_code).distinct()
        serializer = ExerciseModelSerializer(queryset, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = ExerciseModelSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class ExerciseDetailAPIView(APIView):
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_object(self, pk: int) -> Exercise:
        return get_object_or_404(Exercise.objects.prefetch_related('exercise_muscles__muscle_group'), pk=pk)

    def get(self, request, pk: int):
        serializer = ExerciseModelSerializer(self.get_object(pk))
        return Response(serializer.data)

    def patch(self, request, pk: int):
        exercise = self.get_object(pk)
        serializer = ExerciseModelSerializer(exercise, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

    def delete(self, request, pk: int):
        exercise = self.get_object(pk)
        exercise.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

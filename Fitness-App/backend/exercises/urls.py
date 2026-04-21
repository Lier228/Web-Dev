from django.urls import path

from .views import ExerciseDetailAPIView, ExerciseListCreateAPIView, muscle_group_list

urlpatterns = [
    path('muscles/', muscle_group_list),
    path('', ExerciseListCreateAPIView.as_view()),
    path('<int:pk>/', ExerciseDetailAPIView.as_view()),
]

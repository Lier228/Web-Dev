from django.urls import path

from .views import (
    CurrentSessionAPIView,
    SessionExerciseDetailAPIView,
    SessionExerciseListCreateAPIView,
    StartSessionAPIView,
    finish_session_view,
)

urlpatterns = [
    path('start/', StartSessionAPIView.as_view()),
    path('current/', CurrentSessionAPIView.as_view()),
    path('exercise-items/', SessionExerciseListCreateAPIView.as_view()),
    path('exercise-items/<int:pk>/', SessionExerciseDetailAPIView.as_view()),
    path('<int:session_id>/finish/', finish_session_view),
]

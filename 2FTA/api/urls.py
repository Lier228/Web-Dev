from django.urls import path

from . import views

urlpatterns = [
    path('auth/register/', views.register_view, name='register'),
    path('auth/login/', views.login_view, name='login'),
    path('auth/logout/', views.logout_view, name='logout'),

    path('profile/', views.UserProfileView.as_view(), name='profile'),

    path('exercises/muscles/', views.muscle_group_list_view, name='exercise-muscles'),
    path('exercises/', views.ExerciseListCreateView.as_view(), name='exercise-list'),
    path('exercises/<int:pk>/', views.ExerciseDetailView.as_view(), name='exercise-detail'),
    path('exercises/<int:exercise_pk>/last-set/', views.last_set_view, name='last-set'),

    path('sessions/start/', views.StartSessionView.as_view(), name='session-start'),
    path('sessions/current/', views.CurrentSessionView.as_view(), name='session-current'),
    path('sessions/history/', views.SessionHistoryView.as_view(), name='session-history'),
    path('sessions/exercise-items/', views.SessionExerciseItemListCreateView.as_view(), name='session-exercise-items'),
    path('sessions/exercise-items/<int:pk>/', views.SessionExerciseItemDetailView.as_view(), name='session-exercise-item-detail'),
    path('sessions/', views.SessionListCreateView.as_view(), name='session-list'),
    path('sessions/<int:pk>/', views.SessionDetailView.as_view(), name='session-detail'),
    path('sessions/<int:pk>/finish/', views.SessionDetailView.as_view(), name='session-finish'),
    path('sessions/<int:session_pk>/sets/', views.ExerciseSetListCreateView.as_view(), name='set-list'),
    path('sets/<int:pk>/', views.ExerciseSetDetailView.as_view(), name='set-detail'),

    path('stats/dashboard/', views.stats_view, name='stats-dashboard'),
    path('stats/weekly/', views.weekly_stats_view, name='stats-weekly'),
    path('stats/', views.stats_view, name='stats'),
]

from django.urls import path

from .views import weekly_stats_view

urlpatterns = [
    path('weekly/', weekly_stats_view),
]

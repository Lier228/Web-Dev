from django.conf import settings
from django.db import models

from exercises.models import Exercise


class Session(models.Model):
    STATUS_CHOICES = [
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
    ]

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='sessions')
    date = models.DateField(auto_now_add=True)
    start_time = models.DateTimeField(auto_now_add=True)
    finish_time = models.DateTimeField(null=True, blank=True)
    duration = models.DurationField(null=True, blank=True)
    points_sum = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='in_progress')

    def __str__(self) -> str:
        return f'{self.user.username} - {self.date}'


class SessionExercise(models.Model):
    session = models.ForeignKey(Session, on_delete=models.CASCADE, related_name='session_exercises')
    exercise = models.ForeignKey(Exercise, on_delete=models.CASCADE, related_name='session_entries')
    sets = models.PositiveIntegerField()
    reps = models.PositiveIntegerField()
    weight_kg = models.DecimalField(max_digits=8, decimal_places=2, default=0)
    points = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self) -> str:
        return f'{self.session.id} - {self.exercise.name}'

from django.db import models


class MuscleGroup(models.Model):
    code = models.CharField(max_length=30, unique=True)
    name = models.CharField(max_length=100)
    points_modifier = models.DecimalField(max_digits=5, decimal_places=2, default=1.0)

    def __str__(self) -> str:
        return self.name


class Exercise(models.Model):
    EXERCISE_TYPE_CHOICES = [
        ('compound', 'Compound'),
        ('isolation', 'Isolation'),
        ('machine', 'Machine'),
        ('bodyweight', 'Bodyweight'),
        ('yoga', 'Yoga'),
    ]

    name = models.CharField(max_length=150, unique=True)
    description = models.TextField(blank=True)
    image_url = models.URLField(blank=True)
    exercise_type = models.CharField(max_length=20, choices=EXERCISE_TYPE_CHOICES, default='compound')
    base_coefficient = models.DecimalField(max_digits=5, decimal_places=2, default=1.0)
    is_active = models.BooleanField(default=True)

    def __str__(self) -> str:
        return self.name


class ExerciseMuscleGroup(models.Model):
    exercise = models.ForeignKey(Exercise, on_delete=models.CASCADE, related_name='exercise_muscles')
    muscle_group = models.ForeignKey(MuscleGroup, on_delete=models.CASCADE, related_name='muscle_exercises')
    contribution_percent = models.DecimalField(max_digits=5, decimal_places=2)
    is_primary = models.BooleanField(default=False)

    class Meta:
        unique_together = ('exercise', 'muscle_group')

    def __str__(self) -> str:
        return f'{self.exercise.name} - {self.muscle_group.name}'

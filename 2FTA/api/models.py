import uuid

from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils import timezone


class ExerciseManager(models.Manager):
    def by_muscle(self, muscle):
        return self.filter(target_muscle=muscle)


class User(AbstractUser):
    bio = models.TextField(blank=True, default='')
    avatar = models.ImageField(upload_to='avatars/', blank=True, null=True)

    def __str__(self):
        return self.username


class Exercise(models.Model):
    class MuscleGroup(models.TextChoices):
        CHEST = 'chest', 'Chest'
        BACK = 'back', 'Back'
        BICEPS = 'biceps', 'Biceps'
        TRICEPS = 'triceps', 'Triceps'
        SHOULDERS = 'shoulders', 'Shoulders'
        FOREARM = 'forearm', 'Forearm'
        QUADS = 'quads', 'Quads'
        GLUTES = 'glutes', 'Glutes'
        HAMSTRINGS = 'hamstrings', 'Hamstrings'
        CALVES = 'calves', 'Calves'
        ABS = 'abs', 'Abs'
        YOGA = 'yoga', 'Yoga'

    class ExerciseType(models.TextChoices):
        COMPOUND = 'compound', 'Compound'
        ISOLATION = 'isolation', 'Isolation'
        MACHINE = 'machine', 'Machine'
        BODYWEIGHT = 'bodyweight', 'Bodyweight'
        YOGA = 'yoga', 'Yoga'

    MUSCLE_COEFFICIENTS = {
        'chest': 1.0,
        'back': 1.0,
        'biceps': 1.5,
        'triceps': 1.5,
        'shoulders': 1.7,
        'forearm': 1.5,
        'quads': 0.7,
        'glutes': 0.7,
        'hamstrings': 0.7,
        'calves': 1.0,
        'abs': 1.0,
        'yoga': 1.0,
    }

    name = models.CharField(max_length=100)
    target_muscle = models.CharField(max_length=20, choices=MuscleGroup.choices)
    description = models.TextField(blank=True, default='')
    image_url = models.URLField(blank=True, default='')
    video_url = models.URLField(blank=True, default='')
    exercise_type = models.CharField(max_length=20, choices=ExerciseType.choices, default=ExerciseType.COMPOUND)
    base_coefficient = models.DecimalField(max_digits=5, decimal_places=2, default=1.0)
    is_active = models.BooleanField(default=True)

    objects = ExerciseManager()

    def __str__(self):
        return f'{self.name} ({self.target_muscle})'


class Session(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sessions')
    date = models.DateField(default=timezone.now)
    start_time = models.DateTimeField(default=timezone.now)
    finish_time = models.DateTimeField(null=True, blank=True)
    duration = models.DurationField(null=True, blank=True)
    points_sum = models.IntegerField(default=0)

    def finish(self):
        self.finish_time = timezone.now()
        self.duration = self.finish_time - self.start_time
        self.save()

    def recalculate_points(self):
        total = sum(exercise_set.points for exercise_set in self.exercise_sets.all())
        self.points_sum = total
        self.save()

    @property
    def status(self):
        return 'completed' if self.finish_time else 'in_progress'

    def __str__(self):
        return f'Session #{self.id} - {self.user.username} on {self.date}'


class ExerciseSet(models.Model):
    session = models.ForeignKey(Session, on_delete=models.CASCADE, related_name='exercise_sets')
    exercise = models.ForeignKey(Exercise, on_delete=models.PROTECT, related_name='exercise_sets')
    batch_id = models.UUIDField(default=uuid.uuid4, editable=False, db_index=True)
    set_number = models.PositiveIntegerField(editable=False)
    reps = models.IntegerField()
    weight_kg = models.DecimalField(max_digits=7, decimal_places=2)
    points = models.IntegerField(default=0, editable=False)
    notes = models.TextField(blank=True, default='')
    created_at = models.DateTimeField(default=timezone.now, editable=False)

    def save(self, *args, **kwargs):
        if not self.pk:
            last = (
                ExerciseSet.objects.filter(session=self.session, exercise=self.exercise)
                .order_by('set_number')
                .last()
            )
            self.set_number = (last.set_number + 1) if last else 1

        coefficient = Exercise.MUSCLE_COEFFICIENTS.get(self.exercise.target_muscle, 1.0)
        self.points = int(self.reps * float(self.weight_kg) * coefficient)

        super().save(*args, **kwargs)
        self.session.recalculate_points()

    def delete(self, *args, **kwargs):
        session = self.session
        super().delete(*args, **kwargs)
        session.recalculate_points()

    def __str__(self):
        return f'Set #{self.set_number} - {self.exercise.name} ({self.reps} reps @ {self.weight_kg}kg)'


class LastSet(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='last_sets')
    exercise = models.ForeignKey(Exercise, on_delete=models.CASCADE, related_name='last_sets')
    reps = models.IntegerField()
    weight_kg = models.DecimalField(max_digits=7, decimal_places=2)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('user', 'exercise')

    def __str__(self):
        return f'LastSet - {self.user.username} / {self.exercise.name}'

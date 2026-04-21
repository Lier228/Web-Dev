from django.core.management.base import BaseCommand

from exercises.models import Exercise, ExerciseMuscleGroup, MuscleGroup


MUSCLE_GROUPS = [
    ('abs', 'Abs', '1.40'),
    ('quads', 'Quads', '0.75'),
    ('glutes', 'Glutes', '0.75'),
    ('triceps', 'Triceps', '1.30'),
    ('biceps', 'Biceps', '1.30'),
    ('back', 'Back', '1.00'),
    ('chest', 'Chest', '1.00'),
    ('yoga', 'Yoga', '1.10'),
]

EXERCISES = [
    {
        'name': 'Bench Press',
        'description': 'Classic chest exercise with barbell.',
        'exercise_type': 'compound',
        'base_coefficient': '1.00',
        'image_url': 'https://example.com/bench.jpg',
        'muscles': [('chest', '70.00', True), ('triceps', '30.00', False)],
    },
    {
        'name': 'Back Squat',
        'description': 'Lower-body compound lift.',
        'exercise_type': 'compound',
        'base_coefficient': '1.10',
        'image_url': 'https://example.com/squat.jpg',
        'muscles': [('quads', '60.00', True), ('glutes', '40.00', False)],
    },
    {
        'name': 'Barbell Row',
        'description': 'Pulling exercise for the upper back.',
        'exercise_type': 'compound',
        'base_coefficient': '1.00',
        'image_url': 'https://example.com/row.jpg',
        'muscles': [('back', '75.00', True), ('biceps', '25.00', False)],
    },
    {
        'name': 'Plank',
        'description': 'Static core stability exercise.',
        'exercise_type': 'bodyweight',
        'base_coefficient': '0.85',
        'image_url': 'https://example.com/plank.jpg',
        'muscles': [('abs', '100.00', True)],
    },
    {
        'name': 'Yoga Flow',
        'description': 'Mobility and breathing sequence.',
        'exercise_type': 'yoga',
        'base_coefficient': '0.90',
        'image_url': 'https://example.com/yoga.jpg',
        'muscles': [('yoga', '100.00', True)],
    },
]


class Command(BaseCommand):
    help = 'Seeds muscle groups and demo exercises for the fitness tracker.'

    def handle(self, *args, **options):
        muscle_map = {}
        for code, name, modifier in MUSCLE_GROUPS:
            muscle, _ = MuscleGroup.objects.update_or_create(
                code=code,
                defaults={'name': name, 'points_modifier': modifier},
            )
            muscle_map[code] = muscle

        for payload in EXERCISES:
            exercise, _ = Exercise.objects.update_or_create(
                name=payload['name'],
                defaults={
                    'description': payload['description'],
                    'exercise_type': payload['exercise_type'],
                    'base_coefficient': payload['base_coefficient'],
                    'image_url': payload['image_url'],
                    'is_active': True,
                },
            )
            exercise.exercise_muscles.all().delete()
            for code, contribution, is_primary in payload['muscles']:
                ExerciseMuscleGroup.objects.create(
                    exercise=exercise,
                    muscle_group=muscle_map[code],
                    contribution_percent=contribution,
                    is_primary=is_primary,
                )

        self.stdout.write(self.style.SUCCESS('Seed data created or updated.'))

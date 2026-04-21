from urllib.parse import parse_qs, urlparse

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
        'description': 'Classic chest press with a barbell.',
        'exercise_type': 'compound',
        'base_coefficient': '1.00',
        'video_url': 'https://www.youtube.com/watch?v=gRVjAtPip0Y',
        'muscles': [('chest', '70.00', True), ('triceps', '30.00', False)],
    },
    {
        'name': 'Incline Dumbbell Press',
        'description': 'Upper-chest pressing variation with dumbbells.',
        'exercise_type': 'compound',
        'base_coefficient': '1.02',
        'video_url': 'https://www.youtube.com/watch?v=2iBZFwA9b6w',
        'muscles': [('chest', '65.00', True), ('triceps', '25.00', False), ('back', '10.00', False)],
    },
    {
        'name': 'Parallel Bar Dips',
        'description': 'Bodyweight dip for chest and triceps.',
        'exercise_type': 'bodyweight',
        'base_coefficient': '0.98',
        'video_url': 'https://www.youtube.com/watch?v=cJyRpNh2FjU',
        'muscles': [('triceps', '60.00', True), ('chest', '40.00', False)],
    },
    {
        'name': 'Barbell Row',
        'description': 'Upper-back row with a strong lat and biceps focus.',
        'exercise_type': 'compound',
        'base_coefficient': '1.00',
        'video_url': 'https://www.youtube.com/watch?v=DgyslsszCQ0',
        'muscles': [('back', '75.00', True), ('biceps', '25.00', False)],
    },
    {
        'name': 'Lat Pulldown',
        'description': 'Vertical pull for lats and upper back.',
        'exercise_type': 'machine',
        'base_coefficient': '0.94',
        'video_url': 'https://www.youtube.com/watch?v=71d6vnSZG3U',
        'muscles': [('back', '70.00', True), ('biceps', '30.00', False)],
    },
    {
        'name': 'Back Squat',
        'description': 'Lower-body compound squat pattern.',
        'exercise_type': 'compound',
        'base_coefficient': '1.10',
        'video_url': 'https://www.youtube.com/watch?v=61Plfzis9R0',
        'muscles': [('quads', '60.00', True), ('glutes', '40.00', False)],
    },
    {
        'name': 'Bulgarian Split Squat',
        'description': 'Single-leg squat for quads and glutes.',
        'exercise_type': 'compound',
        'base_coefficient': '1.04',
        'video_url': 'https://www.youtube.com/watch?v=GYivEspzykA',
        'muscles': [('quads', '65.00', True), ('glutes', '35.00', False)],
    },
    {
        'name': 'Barbell Curl',
        'description': 'Basic standing curl for biceps strength.',
        'exercise_type': 'isolation',
        'base_coefficient': '0.86',
        'video_url': 'https://www.youtube.com/watch?v=BmFEhhh8sqI',
        'muscles': [('biceps', '100.00', True)],
    },
    {
        'name': 'Hammer Curl',
        'description': 'Neutral-grip curl for biceps and brachialis.',
        'exercise_type': 'isolation',
        'base_coefficient': '0.88',
        'video_url': 'https://www.youtube.com/watch?v=Sf7v8U4h8Jg',
        'muscles': [('biceps', '100.00', True)],
    },
    {
        'name': 'Skull Crusher',
        'description': 'Overhead triceps extension lying on a bench.',
        'exercise_type': 'isolation',
        'base_coefficient': '0.90',
        'video_url': 'https://www.youtube.com/watch?v=NcsjVw206m0',
        'muscles': [('triceps', '100.00', True)],
    },
    {
        'name': 'Plank',
        'description': 'Static core stability exercise.',
        'exercise_type': 'bodyweight',
        'base_coefficient': '0.85',
        'video_url': 'https://www.youtube.com/watch?v=pSHjTRCQxIw',
        'muscles': [('abs', '100.00', True)],
    },
    {
        'name': 'Yoga Flow',
        'description': 'Beginner-friendly mobility and breathing flow.',
        'exercise_type': 'yoga',
        'base_coefficient': '0.90',
        'video_url': 'https://www.youtube.com/watch?v=MVPXbBe1E3E',
        'muscles': [('yoga', '100.00', True)],
    },
]


def youtube_thumbnail(video_url: str) -> str:
    parsed = urlparse(video_url)
    host = parsed.netloc.lower()
    video_id = ''

    if 'youtu.be' in host:
        video_id = parsed.path.strip('/')
    elif 'youtube.com' in host:
        video_id = parse_qs(parsed.query).get('v', [''])[0]
        if not video_id and '/embed/' in parsed.path:
            video_id = parsed.path.rsplit('/embed/', 1)[-1].split('/', 1)[0]

    if not video_id:
        return ''

    return f'https://img.youtube.com/vi/{video_id}/hqdefault.jpg'


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
                    'image_url': youtube_thumbnail(payload['video_url']),
                    'video_url': payload['video_url'],
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

from urllib.parse import parse_qs, urlparse

from django.core.management.base import BaseCommand

from api.models import Exercise


EXERCISES = [
    {
        'name': 'Bench Press',
        'target_muscle': Exercise.MuscleGroup.CHEST,
        'description': 'Classic chest press with a barbell.',
        'exercise_type': Exercise.ExerciseType.COMPOUND,
        'base_coefficient': '1.00',
        'video_url': 'https://www.youtube.com/watch?v=gRVjAtPip0Y',
    },
    {
        'name': 'Incline Dumbbell Press',
        'target_muscle': Exercise.MuscleGroup.CHEST,
        'description': 'Upper chest pressing variation with dumbbells.',
        'exercise_type': Exercise.ExerciseType.COMPOUND,
        'base_coefficient': '1.02',
        'video_url': 'https://www.youtube.com/watch?v=2iBZFwA9b6w',
    },
    {
        'name': 'Parallel Bar Dips',
        'target_muscle': Exercise.MuscleGroup.TRICEPS,
        'description': 'Bodyweight dip for chest and triceps.',
        'exercise_type': Exercise.ExerciseType.BODYWEIGHT,
        'base_coefficient': '0.98',
        'video_url': 'https://www.youtube.com/watch?v=cJyRpNh2FjU',
    },
    {
        'name': 'Barbell Row',
        'target_muscle': Exercise.MuscleGroup.BACK,
        'description': 'Upper back row with strong lat engagement.',
        'exercise_type': Exercise.ExerciseType.COMPOUND,
        'base_coefficient': '1.00',
        'video_url': 'https://www.youtube.com/watch?v=DgyslsszCQ0',
    },
    {
        'name': 'Lat Pulldown',
        'target_muscle': Exercise.MuscleGroup.BACK,
        'description': 'Vertical pull for lats and upper back.',
        'exercise_type': Exercise.ExerciseType.MACHINE,
        'base_coefficient': '0.94',
        'video_url': 'https://www.youtube.com/watch?v=CAwf7n6Luuc',
    },
    {
        'name': 'Back Squat',
        'target_muscle': Exercise.MuscleGroup.QUADS,
        'description': 'Lower body compound squat pattern.',
        'exercise_type': Exercise.ExerciseType.COMPOUND,
        'base_coefficient': '1.10',
        'video_url': 'https://www.youtube.com/watch?v=ultWZbUMPL8',
    },
    {
        'name': 'Bulgarian Split Squat',
        'target_muscle': Exercise.MuscleGroup.GLUTES,
        'description': 'Single leg squat for quads and glutes.',
        'exercise_type': Exercise.ExerciseType.COMPOUND,
        'base_coefficient': '1.04',
        'video_url': 'https://www.youtube.com/watch?v=2C-uNgKwPLE',
    },
    {
        'name': 'Barbell Curl',
        'target_muscle': Exercise.MuscleGroup.BICEPS,
        'description': 'Standing curl for biceps strength.',
        'exercise_type': Exercise.ExerciseType.ISOLATION,
        'base_coefficient': '0.86',
        'video_url': 'https://www.youtube.com/watch?v=kwG2ipFRgfo',
    },
    {
        'name': 'Hammer Curl',
        'target_muscle': Exercise.MuscleGroup.BICEPS,
        'description': 'Neutral grip curl for biceps and brachialis.',
        'exercise_type': Exercise.ExerciseType.ISOLATION,
        'base_coefficient': '0.88',
        'video_url': 'https://www.youtube.com/watch?v=zC3nLlEvin4',
    },
    {
        'name': 'Skull Crusher',
        'target_muscle': Exercise.MuscleGroup.TRICEPS,
        'description': 'Lying triceps extension on a bench.',
        'exercise_type': Exercise.ExerciseType.ISOLATION,
        'base_coefficient': '0.90',
        'video_url': 'https://www.youtube.com/watch?v=d_KZxkY_0cM',
    },
    {
        'name': 'Plank',
        'target_muscle': Exercise.MuscleGroup.ABS,
        'description': 'Static core stability exercise.',
        'exercise_type': Exercise.ExerciseType.BODYWEIGHT,
        'base_coefficient': '0.85',
        'video_url': 'https://www.youtube.com/watch?v=pSHjTRCQxIw',
    },
    {
        'name': 'Yoga Flow',
        'target_muscle': Exercise.MuscleGroup.YOGA,
        'description': 'Beginner friendly mobility and breathing flow.',
        'exercise_type': Exercise.ExerciseType.YOGA,
        'base_coefficient': '0.90',
        'video_url': 'https://www.youtube.com/watch?v=v7AYKMP6rOE',
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
    help = 'Seed the fitness exercise catalog with YouTube-backed demo entries.'

    def handle(self, *args, **options):
        for payload in EXERCISES:
            Exercise.objects.update_or_create(
                name=payload['name'],
                defaults={
                    'target_muscle': payload['target_muscle'],
                    'description': payload['description'],
                    'exercise_type': payload['exercise_type'],
                    'base_coefficient': payload['base_coefficient'],
                    'video_url': payload['video_url'],
                    'image_url': youtube_thumbnail(payload['video_url']),
                    'is_active': True,
                },
            )

        self.stdout.write(self.style.SUCCESS('Exercise seed data created or updated.'))

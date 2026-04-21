from decimal import Decimal

from django.contrib.auth import authenticate
from rest_framework import serializers

from .models import Exercise, ExerciseSet, LastSet, Session, User


MUSCLE_ORDER = [choice[0] for choice in Exercise.MuscleGroup.choices]
MUSCLE_INDEX = {code: index + 1 for index, code in enumerate(MUSCLE_ORDER)}
MUSCLE_LABELS = dict(Exercise.MuscleGroup.choices)


def build_muscle_group_payload(code: str) -> dict:
    coefficient = Decimal(str(Exercise.MUSCLE_COEFFICIENTS.get(code, 1.0)))
    return {
        'id': MUSCLE_INDEX.get(code, 0),
        'code': code,
        'name': MUSCLE_LABELS.get(code, code.replace('_', ' ').title()),
        'points_modifier': f'{coefficient:.2f}',
    }


class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        username = data['username'].strip()
        password = data['password']
        if not username:
            raise serializers.ValidationError({'username': 'Username is required.'})
        user = authenticate(username=username, password=password)
        if not user:
            raise serializers.ValidationError('Invalid username or password.')
        if not user.is_active:
            raise serializers.ValidationError('This account is disabled.')
        return {'user': user}


class MuscleGroupSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    code = serializers.CharField()
    name = serializers.CharField()
    points_modifier = serializers.CharField()


class SessionExerciseItemCreateSerializer(serializers.Serializer):
    session = serializers.PrimaryKeyRelatedField(queryset=Session.objects.all())
    exercise = serializers.PrimaryKeyRelatedField(queryset=Exercise.objects.filter(is_active=True))
    weight_kg = serializers.DecimalField(
        max_digits=7,
        decimal_places=2,
        min_value=Decimal('0.25'),
        error_messages={'min_value': 'Weight must be at least 0.25 kg.'},
    )
    reps = serializers.IntegerField(min_value=1, max_value=200)
    sets = serializers.IntegerField(min_value=1, max_value=20)
    notes = serializers.CharField(required=False, allow_blank=True, default='', max_length=500)

    def validate_notes(self, value):
        return value.strip()

    def validate(self, attrs):
        request = self.context.get('request')
        session = attrs['session']
        exercise = attrs['exercise']

        if request and session.user_id != request.user.id:
            raise serializers.ValidationError({'session': 'You can only add exercises to your own session.'})
        if session.finish_time:
            raise serializers.ValidationError({'session': 'Cannot add exercises to a finished session.'})
        if not exercise.is_active:
            raise serializers.ValidationError({'exercise': 'This exercise is inactive.'})

        return attrs


class SessionExerciseItemSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    session = serializers.IntegerField()
    exercise = serializers.IntegerField()
    exercise_name = serializers.CharField()
    sets = serializers.IntegerField()
    reps = serializers.IntegerField()
    weight_kg = serializers.CharField()
    points = serializers.CharField()
    notes = serializers.CharField()
    created_at = serializers.DateTimeField()


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=4, max_length=128)

    class Meta:
        model = User
        fields = ['id', 'username', 'password']

    def validate_username(self, value):
        normalized = value.strip()
        if len(normalized) < 3:
            raise serializers.ValidationError('Username must be at least 3 characters long.')
        if normalized != value:
            raise serializers.ValidationError('Username cannot start or end with spaces.')
        if User.objects.filter(username__iexact=normalized).exists():
            raise serializers.ValidationError('Username is already taken.')
        return normalized

    def create(self, validated_data):
        return User.objects.create_user(username=validated_data['username'], password=validated_data['password'])


class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'bio', 'avatar']
        read_only_fields = ['id', 'username']

    def validate_bio(self, value):
        if len(value) > 500:
            raise serializers.ValidationError('Bio cannot be longer than 500 characters.')
        return value.strip()

    def validate_avatar(self, value):
        if not value:
            return value

        content_type = getattr(value, 'content_type', '')
        if content_type and not content_type.startswith('image/'):
            raise serializers.ValidationError('Avatar must be an image file.')

        size = getattr(value, 'size', 0)
        if size and size > 5 * 1024 * 1024:
            raise serializers.ValidationError('Avatar file size must be 5 MB or less.')

        return value


class ExerciseSerializer(serializers.ModelSerializer):
    exercise_muscles = serializers.SerializerMethodField()

    class Meta:
        model = Exercise
        fields = [
            'id',
            'name',
            'target_muscle',
            'description',
            'image_url',
            'video_url',
            'exercise_type',
            'base_coefficient',
            'is_active',
            'exercise_muscles',
        ]

    def validate_name(self, value):
        normalized = value.strip()
        if len(normalized) < 2:
            raise serializers.ValidationError('Exercise name must be at least 2 characters long.')
        return normalized

    def validate_description(self, value):
        cleaned = value.strip()
        if len(cleaned) > 1200:
            raise serializers.ValidationError('Description cannot be longer than 1200 characters.')
        return cleaned

    def validate_base_coefficient(self, value):
        if value <= 0:
            raise serializers.ValidationError('Base coefficient must be greater than 0.')
        return value

    def validate(self, attrs):
        name = attrs.get('name', getattr(self.instance, 'name', None))
        target_muscle = attrs.get('target_muscle', getattr(self.instance, 'target_muscle', None))
        if name and target_muscle:
            queryset = Exercise.objects.filter(name__iexact=name, target_muscle=target_muscle)
            if self.instance:
                queryset = queryset.exclude(pk=self.instance.pk)
            if queryset.exists():
                raise serializers.ValidationError({
                    'name': 'An exercise with this name already exists in this muscle category.',
                })
        return attrs

    def get_exercise_muscles(self, obj):
        return [
            {
                'id': obj.id,
                'muscle_group': build_muscle_group_payload(obj.target_muscle),
                'contribution_percent': '100.00',
                'is_primary': True,
            }
        ]


class ExerciseSetSerializer(serializers.ModelSerializer):
    exercise_name = serializers.CharField(source='exercise.name', read_only=True)
    target_muscle = serializers.CharField(source='exercise.target_muscle', read_only=True)

    class Meta:
        model = ExerciseSet
        fields = [
            'id',
            'exercise',
            'exercise_name',
            'target_muscle',
            'batch_id',
            'set_number',
            'reps',
            'weight_kg',
            'points',
            'notes',
            'created_at',
        ]
        read_only_fields = ['batch_id', 'set_number', 'points', 'created_at']

    def validate_notes(self, value):
        return value.strip()

    def validate_weight_kg(self, value):
        if value < Decimal('0.25'):
            raise serializers.ValidationError('Weight must be at least 0.25 kg.')
        return value

    def validate_reps(self, value):
        if value > 200:
            raise serializers.ValidationError('Reps must be 200 or fewer.')
        return value

    def validate(self, attrs):
        exercise = attrs.get('exercise', getattr(self.instance, 'exercise', None))
        if exercise and not exercise.is_active:
            raise serializers.ValidationError({'exercise': 'This exercise is inactive.'})
        return attrs


class SessionSerializer(serializers.ModelSerializer):
    date = serializers.SerializerMethodField()
    status = serializers.SerializerMethodField()

    class Meta:
        model = Session
        fields = ['id', 'date', 'start_time', 'finish_time', 'duration', 'points_sum', 'status']
        read_only_fields = ['date', 'start_time', 'finish_time', 'duration', 'points_sum', 'status']

    def get_status(self, obj):
        return obj.status

    def get_date(self, obj):
        value = obj.date
        if hasattr(value, 'date'):
            value = value.date()
        return value.isoformat()


class LastSetSerializer(serializers.ModelSerializer):
    exercise_name = serializers.CharField(source='exercise.name', read_only=True)
    target_muscle = serializers.CharField(source='exercise.target_muscle', read_only=True)

    class Meta:
        model = LastSet
        fields = ['id', 'exercise', 'exercise_name', 'target_muscle', 'reps', 'weight_kg', 'updated_at']
        read_only_fields = ['updated_at']


class SessionHistoryQuerySerializer(serializers.Serializer):
    status = serializers.ChoiceField(
        choices=['all', 'in_progress', 'completed'],
        default='all',
        required=False,
    )
    page = serializers.IntegerField(min_value=1, default=1, required=False)
    page_size = serializers.IntegerField(min_value=1, max_value=50, default=10, required=False)
    ordering = serializers.ChoiceField(
        choices=['newest', 'oldest', 'points'],
        default='newest',
        required=False,
    )
    date_from = serializers.DateField(required=False)
    date_to = serializers.DateField(required=False)

    def validate(self, attrs):
        date_from = attrs.get('date_from')
        date_to = attrs.get('date_to')
        if date_from and date_to and date_from > date_to:
            raise serializers.ValidationError({'date_from': 'date_from cannot be later than date_to.'})
        return attrs


class StatsQuerySerializer(serializers.Serializer):
    period = serializers.ChoiceField(
        choices=['week', 'month', 'quarter', 'all', 'custom'],
        default='all',
        required=False,
    )
    interval = serializers.ChoiceField(
        choices=['day', 'week'],
        default='week',
        required=False,
    )
    date_from = serializers.DateField(required=False)
    date_to = serializers.DateField(required=False)

    def validate(self, attrs):
        period = attrs.get('period', 'all')
        date_from = attrs.get('date_from')
        date_to = attrs.get('date_to')

        if period == 'custom' and not (date_from and date_to):
            raise serializers.ValidationError({
                'date_from': 'date_from and date_to are required when period=custom.',
            })
        if date_from and date_to and date_from > date_to:
            raise serializers.ValidationError({'date_from': 'date_from cannot be later than date_to.'})

        return attrs

from rest_framework import serializers

from .models import Session, SessionExercise
from .services import calculate_exercise_points


class SessionModelSerializer(serializers.ModelSerializer):
    class Meta:
        model = Session
        fields = ['id', 'date', 'start_time', 'finish_time', 'duration', 'points_sum', 'status']
        read_only_fields = ['date', 'start_time', 'finish_time', 'duration', 'points_sum', 'status']


class SessionExerciseModelSerializer(serializers.ModelSerializer):
    exercise_name = serializers.CharField(source='exercise.name', read_only=True)

    class Meta:
        model = SessionExercise
        fields = [
            'id',
            'session',
            'exercise',
            'exercise_name',
            'sets',
            'reps',
            'weight_kg',
            'points',
            'notes',
            'created_at',
        ]
        read_only_fields = ['points', 'created_at']

    def validate_session(self, value: Session) -> Session:
        if value.status != 'in_progress':
            raise serializers.ValidationError('You can only edit an active session')
        return value

    def validate(self, attrs: dict) -> dict:
        sets_value = attrs.get('sets', getattr(self.instance, 'sets', 0))
        reps_value = attrs.get('reps', getattr(self.instance, 'reps', 0))
        weight_value = attrs.get('weight_kg', getattr(self.instance, 'weight_kg', 0))

        if sets_value <= 0:
            raise serializers.ValidationError({'sets': 'Sets must be greater than 0'})
        if reps_value <= 0:
            raise serializers.ValidationError({'reps': 'Reps must be greater than 0'})
        if weight_value < 0:
            raise serializers.ValidationError({'weight_kg': 'Weight cannot be negative'})
        return attrs

    def create(self, validated_data: dict) -> SessionExercise:
        exercise = validated_data['exercise']
        validated_data['points'] = calculate_exercise_points(
            exercise=exercise,
            sets=validated_data['sets'],
            reps=validated_data['reps'],
            weight_kg=validated_data['weight_kg'],
        )
        return super().create(validated_data)

    def update(self, instance: SessionExercise, validated_data: dict) -> SessionExercise:
        exercise = validated_data.get('exercise', instance.exercise)
        sets_value = validated_data.get('sets', instance.sets)
        reps_value = validated_data.get('reps', instance.reps)
        weight_value = validated_data.get('weight_kg', instance.weight_kg)
        validated_data['points'] = calculate_exercise_points(exercise, sets_value, reps_value, weight_value)
        return super().update(instance, validated_data)

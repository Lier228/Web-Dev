from rest_framework import serializers

from .models import Exercise, ExerciseMuscleGroup, MuscleGroup


class MuscleGroupModelSerializer(serializers.ModelSerializer):
    class Meta:
        model = MuscleGroup
        fields = ['id', 'code', 'name', 'points_modifier']


class ExerciseMuscleGroupModelSerializer(serializers.ModelSerializer):
    muscle_group = MuscleGroupModelSerializer(read_only=True)
    muscle_group_id = serializers.PrimaryKeyRelatedField(
        source='muscle_group',
        queryset=MuscleGroup.objects.all(),
        write_only=True,
    )

    class Meta:
        model = ExerciseMuscleGroup
        fields = ['id', 'muscle_group', 'muscle_group_id', 'contribution_percent', 'is_primary']


class ExerciseModelSerializer(serializers.ModelSerializer):
    exercise_muscles = ExerciseMuscleGroupModelSerializer(many=True, required=False)

    class Meta:
        model = Exercise
        fields = [
            'id',
            'name',
            'description',
            'image_url',
            'exercise_type',
            'base_coefficient',
            'is_active',
            'exercise_muscles',
        ]

    def create(self, validated_data: dict) -> Exercise:
        muscles_data = validated_data.pop('exercise_muscles', [])
        exercise = Exercise.objects.create(**validated_data)
        for item in muscles_data:
            ExerciseMuscleGroup.objects.create(exercise=exercise, **item)
        return exercise

    def update(self, instance: Exercise, validated_data: dict) -> Exercise:
        muscles_data = validated_data.pop('exercise_muscles', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        if muscles_data is not None:
            instance.exercise_muscles.all().delete()
            for item in muscles_data:
                ExerciseMuscleGroup.objects.create(exercise=instance, **item)

        return instance

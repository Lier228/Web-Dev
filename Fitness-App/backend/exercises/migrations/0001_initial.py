from django.db import migrations, models


class Migration(migrations.Migration):
    initial = True

    dependencies = []

    operations = [
        migrations.CreateModel(
            name='Exercise',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=150, unique=True)),
                ('description', models.TextField(blank=True)),
                ('image_url', models.URLField(blank=True)),
                (
                    'exercise_type',
                    models.CharField(
                        choices=[
                            ('compound', 'Compound'),
                            ('isolation', 'Isolation'),
                            ('machine', 'Machine'),
                            ('bodyweight', 'Bodyweight'),
                            ('yoga', 'Yoga'),
                        ],
                        default='compound',
                        max_length=20,
                    ),
                ),
                ('base_coefficient', models.DecimalField(decimal_places=2, default=1.0, max_digits=5)),
                ('is_active', models.BooleanField(default=True)),
            ],
        ),
        migrations.CreateModel(
            name='MuscleGroup',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('code', models.CharField(max_length=30, unique=True)),
                ('name', models.CharField(max_length=100)),
                ('points_modifier', models.DecimalField(decimal_places=2, default=1.0, max_digits=5)),
            ],
        ),
        migrations.CreateModel(
            name='ExerciseMuscleGroup',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('contribution_percent', models.DecimalField(decimal_places=2, max_digits=5)),
                ('is_primary', models.BooleanField(default=False)),
                (
                    'exercise',
                    models.ForeignKey(on_delete=models.deletion.CASCADE, related_name='exercise_muscles', to='exercises.exercise'),
                ),
                (
                    'muscle_group',
                    models.ForeignKey(on_delete=models.deletion.CASCADE, related_name='muscle_exercises', to='exercises.musclegroup'),
                ),
            ],
            options={
                'unique_together': {('exercise', 'muscle_group')},
            },
        ),
    ]


import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):
    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('exercises', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='Session',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('date', models.DateField(auto_now_add=True)),
                ('start_time', models.DateTimeField(auto_now_add=True)),
                ('finish_time', models.DateTimeField(blank=True, null=True)),
                ('duration', models.DurationField(blank=True, null=True)),
                ('points_sum', models.DecimalField(decimal_places=2, default=0, max_digits=10)),
                (
                    'status',
                    models.CharField(
                        choices=[('in_progress', 'In Progress'), ('completed', 'Completed')],
                        default='in_progress',
                        max_length=20,
                    ),
                ),
                (
                    'user',
                    models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='sessions', to=settings.AUTH_USER_MODEL),
                ),
            ],
        ),
        migrations.CreateModel(
            name='SessionExercise',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('sets', models.PositiveIntegerField()),
                ('reps', models.PositiveIntegerField()),
                ('weight_kg', models.DecimalField(decimal_places=2, default=0, max_digits=8)),
                ('points', models.DecimalField(decimal_places=2, default=0, max_digits=10)),
                ('notes', models.TextField(blank=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                (
                    'exercise',
                    models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='session_entries', to='exercises.exercise'),
                ),
                (
                    'session',
                    models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='session_exercises', to='fitness_sessions.session'),
                ),
            ],
        ),
    ]

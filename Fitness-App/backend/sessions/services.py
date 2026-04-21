from decimal import Decimal

from django.utils import timezone

from .models import Session


def calculate_exercise_points(exercise, sets, reps, weight_kg):
    raw_points = (Decimal(sets) * Decimal(reps) * Decimal(weight_kg)) / Decimal('100')
    total_points = Decimal('0.00')
    muscles = exercise.exercise_muscles.select_related('muscle_group').all()

    if not muscles:
        return raw_points.quantize(Decimal('0.01'))

    for relation in muscles:
        contribution = Decimal(relation.contribution_percent) / Decimal('100')
        total_points += (
            raw_points
            * Decimal(exercise.base_coefficient)
            * Decimal(relation.muscle_group.points_modifier)
            * contribution
        )

    return total_points.quantize(Decimal('0.01'))


def recalculate_session_points(session: Session) -> None:
    total = Decimal('0.00')
    for item in session.session_exercises.all():
        total += Decimal(item.points)
    session.points_sum = total.quantize(Decimal('0.01'))
    session.save(update_fields=['points_sum'])


def finish_session(session: Session) -> Session:
    if session.status == 'completed':
        return session
    session.finish_time = timezone.now()
    session.duration = session.finish_time - session.start_time
    session.status = 'completed'
    session.save(update_fields=['finish_time', 'duration', 'status'])
    return session

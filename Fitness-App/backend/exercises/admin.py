from django.contrib import admin

from .models import Exercise, ExerciseMuscleGroup, MuscleGroup


class ExerciseMuscleGroupInline(admin.TabularInline):
    model = ExerciseMuscleGroup
    extra = 1


@admin.register(Exercise)
class ExerciseAdmin(admin.ModelAdmin):
    list_display = ('name', 'exercise_type', 'base_coefficient', 'is_active')
    list_filter = ('exercise_type', 'is_active')
    search_fields = ('name',)
    inlines = [ExerciseMuscleGroupInline]


@admin.register(MuscleGroup)
class MuscleGroupAdmin(admin.ModelAdmin):
    list_display = ('name', 'code', 'points_modifier')
    search_fields = ('name', 'code')

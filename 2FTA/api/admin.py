from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, Exercise, Session, ExerciseSet, LastSet


@admin.register(User)
class CustomUserAdmin(UserAdmin):
    list_display = ['username', 'email', 'is_staff']
    fieldsets = UserAdmin.fieldsets + (
        ('Profile', {'fields': ('bio', 'avatar')}),
    )


@admin.register(Exercise)
class ExerciseAdmin(admin.ModelAdmin):
    list_display  = ['name', 'target_muscle', 'description']
    list_filter   = ['target_muscle']
    search_fields = ['name']


@admin.register(Session)
class SessionAdmin(admin.ModelAdmin):
    list_display = ['id', 'user', 'date', 'start_time', 'finish_time', 'points_sum']
    list_filter  = ['user']


@admin.register(ExerciseSet)
class ExerciseSetAdmin(admin.ModelAdmin):
    list_display = ['id', 'session', 'exercise', 'set_number', 'reps', 'weight_kg', 'points']


@admin.register(LastSet)
class LastSetAdmin(admin.ModelAdmin):
    list_display = ['user', 'exercise', 'reps', 'weight_kg', 'updated_at']
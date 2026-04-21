from django.contrib import admin

from .models import Session, SessionExercise


class SessionExerciseInline(admin.TabularInline):
    model = SessionExercise
    extra = 0
    readonly_fields = ('points', 'created_at')


@admin.register(Session)
class SessionAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'date', 'status', 'points_sum', 'start_time', 'finish_time')
    list_filter = ('status', 'date')
    search_fields = ('user__username',)
    inlines = [SessionExerciseInline]

import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { Exercise, LoginResponse, MuscleGroup, Session, SessionExercise, User, WeeklyStats } from '../core/models/api.models';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = 'http://127.0.0.1:8000/api';

  login(data: { username: string; password: string }): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.baseUrl}/auth/login/`, data);
  }

  register(data: { username: string; password: string }): Observable<{ id: number; username: string }> {
    return this.http.post<{ id: number; username: string }>(`${this.baseUrl}/auth/register/`, data);
  }

  logout(refresh: string): Observable<{ detail: string }> {
    return this.http.post<{ detail: string }>(`${this.baseUrl}/auth/logout/`, { refresh });
  }

  getProfile(): Observable<User> {
    return this.http.get<User>(`${this.baseUrl}/profile/`);
  }

  updateProfile(data: FormData): Observable<User> {
    return this.http.patch<User>(`${this.baseUrl}/profile/`, data);
  }

  getMuscles(): Observable<MuscleGroup[]> {
    return this.http.get<MuscleGroup[]>(`${this.baseUrl}/exercises/muscles/`);
  }

  getExercises(muscle?: string): Observable<Exercise[]> {
    const options = muscle
      ? { params: new HttpParams().set('muscle', muscle) }
      : undefined;
    return this.http.get<Exercise[]>(`${this.baseUrl}/exercises/`, options);
  }

  startSession(): Observable<Session> {
    return this.http.post<Session>(`${this.baseUrl}/sessions/start/`, {});
  }

  getCurrentSession(): Observable<Session> {
    return this.http.get<Session>(`${this.baseUrl}/sessions/current/`);
  }

  getSessionExercises(sessionId?: number): Observable<SessionExercise[]> {
    const options = sessionId
      ? { params: new HttpParams().set('session_id', String(sessionId)) }
      : undefined;
    return this.http.get<SessionExercise[]>(`${this.baseUrl}/sessions/exercise-items/`, options);
  }

  addExerciseToSession(payload: {
    session: number;
    exercise: number;
    weight_kg: number;
    reps: number;
    sets: number;
    notes: string;
  }): Observable<SessionExercise> {
    return this.http.post<SessionExercise>(`${this.baseUrl}/sessions/exercise-items/`, payload);
  }

  deleteSessionExercise(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/sessions/exercise-items/${id}/`);
  }

  finishSession(id: number): Observable<Session> {
    return this.http.post<Session>(`${this.baseUrl}/sessions/${id}/finish/`, {});
  }

  getWeeklyStats(): Observable<WeeklyStats> {
    return this.http.get<WeeklyStats>(`${this.baseUrl}/stats/weekly/?period=week`);
  }
}

import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, inject } from '@angular/core';

import { Exercise, Session, SessionExercise } from '../core/models/api.models';
import { ApiService } from '../services/api.service';
import { ExerciseLogModalComponent, ExerciseLogPayload } from '../shared/exercise-log-modal.component';

@Component({
  selector: 'app-session-page',
  standalone: true,
  imports: [CommonModule, ExerciseLogModalComponent],
  template: `
    <section class="page-stack">
      <div class="page-head">
        <div>
          <h1 class="page-title">Session</h1>
          <p class="muted">Start your workout and log each exercise quickly.</p>
        </div>
        <div class="toolbar">
          <button class="btn" type="button" (click)="startSession()" [disabled]="loading">
            {{ currentSession?.status === 'in_progress' ? 'Session Active' : 'Start Session' }}
          </button>
          <button class="btn warn" type="button" *ngIf="canEditSession()" (click)="finishSession()">Finish</button>
        </div>
      </div>

      <div class="flash error" *ngIf="error">{{ error }}</div>
      <div class="flash" *ngIf="message">{{ message }}</div>

      <div class="card" *ngIf="currentSession; else noSession">
        <div class="toolbar">
          <div>
            <div class="muted">Current session</div>
            <strong>#{{ currentSession.id }} ({{ currentSession.status }})</strong>
          </div>
          <span class="badge">{{ currentSession.points_sum }} points</span>
        </div>
      </div>

      <ng-template #noSession>
        <section class="card">
          <p class="muted">No active session. Start one before adding exercises.</p>
        </section>
      </ng-template>

      <section class="card empty-state" *ngIf="canEditSession() && items.length === 0">
        <div class="muted">Add Exercise</div>
        <button class="btn icon" type="button" (click)="openAddModal()">+</button>
        <div class="muted">Your session is empty. Start with your first exercise.</div>
      </section>

      <section class="card page-stack" *ngIf="canEditSession() && items.length > 0">
        <div class="page-head">
          <div>
            <h2>Session Exercises</h2>
            <div class="muted">Logged in this active session</div>
          </div>
          <button class="btn secondary" type="button" (click)="openAddModal()">Add Exercise</button>
        </div>

        <div class="session-list">
          <div class="session-item" *ngFor="let item of items; trackBy: trackByItem">
            <div>
              <strong>{{ item.exercise_name }}</strong>
              <div class="muted">{{ item.weight_kg }} kg • {{ item.reps }} reps • {{ item.sets }} sets</div>
            </div>
            <button class="btn secondary" type="button" (click)="removeItem(item.id)">Delete</button>
          </div>
        </div>
      </section>

      <app-exercise-log-modal
        [open]="isModalOpen"
        [allowExercisePicker]="true"
        [exercises]="exercises"
        (close)="closeModal()"
        (submitLog)="addExerciseToSession($event)"
      ></app-exercise-log-modal>
    </section>
  `,
})
export class SessionPageComponent implements OnInit {
  private readonly api = inject(ApiService);

  currentSession: Session | null = null;
  exercises: Exercise[] = [];
  items: SessionExercise[] = [];
  isModalOpen = false;
  loading = false;
  error = '';
  message = '';

  ngOnInit(): void {
    this.api.getExercises().subscribe((exercises) => (this.exercises = exercises));
    this.loadCurrentSession();
  }

  loadCurrentSession(): void {
    this.api.getCurrentSession().subscribe({
      next: (session) => {
        this.currentSession = session;
        this.loadItems();
      },
      error: (error: HttpErrorResponse) => {
        if (error.status !== 404) {
          this.error = 'Failed to load current session.';
        } else {
          this.currentSession = null;
          this.items = [];
        }
      },
    });
  }

  startSession(): void {
    this.loading = true;
    this.api.startSession().subscribe({
      next: (session) => {
        this.currentSession = session;
        this.message = 'Session is ready.';
        this.error = '';
        this.loadItems();
      },
      error: () => {
        this.error = 'Failed to start session.';
        this.loading = false;
      },
      complete: () => {
        this.loading = false;
      },
    });
  }

  loadItems(): void {
    if (!this.currentSession) {
      this.items = [];
      return;
    }

    this.api.getSessionExercises(this.currentSession.id).subscribe((items) => {
      this.items = items;
    });
  }

  openAddModal(): void {
    if (!this.canEditSession()) {
      this.message = '';
      this.error = 'Start a session first.';
      return;
    }
    this.isModalOpen = true;
  }

  closeModal(): void {
    this.isModalOpen = false;
  }

  addExerciseToSession(payload: ExerciseLogPayload): void {
    if (!this.currentSession) {
      return;
    }

    this.api
      .addExerciseToSession({
        session: this.currentSession.id,
        exercise: payload.exerciseId,
        weight_kg: payload.weightKg,
        reps: payload.reps,
        sets: payload.sets,
        notes: payload.notes,
      })
      .subscribe({
        next: () => {
          this.message = 'Exercise added.';
          this.error = '';
          this.isModalOpen = false;
          this.loadItems();
          this.loadCurrentSession();
        },
        error: () => {
          this.error = 'Failed to add exercise to the session.';
          this.message = '';
        },
      });
  }

  removeItem(id: number): void {
    this.api.deleteSessionExercise(id).subscribe({
      next: () => {
        this.loadItems();
        this.loadCurrentSession();
      },
      error: () => {
        this.error = 'Failed to delete entry.';
      },
    });
  }

  finishSession(): void {
    if (!this.currentSession) {
      return;
    }

    this.api.finishSession(this.currentSession.id).subscribe({
      next: (session) => {
        this.currentSession = session;
        this.items = [];
        this.message = 'Session finished.';
      },
      error: () => {
        this.error = 'Failed to finish session.';
      },
    });
  }

  trackByItem(_: number, item: SessionExercise): number {
    return item.id;
  }

  canEditSession(): boolean {
    return this.currentSession?.status === 'in_progress';
  }
}

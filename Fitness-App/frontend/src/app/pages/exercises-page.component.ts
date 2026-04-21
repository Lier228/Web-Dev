import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild, inject } from '@angular/core';

import { Exercise, MuscleGroup } from '../core/models/api.models';
import { ApiService } from '../services/api.service';
import { ExerciseLogModalComponent, ExerciseLogPayload } from '../shared/exercise-log-modal.component';

@Component({
  selector: 'app-exercises-page',
  standalone: true,
  imports: [CommonModule, ExerciseLogModalComponent],
  template: `
    <section class="page-stack">
      <div class="page-head">
        <div>
          <h1 class="page-title">Exercises</h1>
          <p class="muted">Choose category, open card, log instantly.</p>
        </div>
        <span class="badge">{{ visibleExercises.length }} shown</span>
      </div>

      <div class="flash error" *ngIf="error">{{ error }}</div>
      <div class="flash" *ngIf="message">{{ message }}</div>

      <div class="tabs-row">
        <button class="chip-tab" type="button" [class.active]="selectedMuscle === ''" (click)="selectMuscle('')">all</button>
        <button
          class="chip-tab"
          type="button"
          *ngFor="let muscle of muscles; trackBy: trackByMuscle"
          [class.active]="selectedMuscle === muscle.code"
          (click)="selectMuscle(muscle.code)"
        >
          {{ muscle.code }}
        </button>
      </div>

      <div class="gallery">
        <article class="exercise-card" *ngFor="let exercise of visibleExercises; trackBy: trackByExercise" (click)="openAddModal(exercise)">
          <img [src]="imageFor(exercise)" [alt]="exercise.name" (error)="markImageBroken(exercise.id)" />
          <div class="exercise-meta">
            <div>{{ exercise.name }}</div>
            <div class="muted">{{ exercise.exercise_type }}</div>
          </div>
        </article>
      </div>

      <div #scrollAnchor class="gallery-anchor"></div>
      <div class="muted" *ngIf="hasMore">Scroll down to load more...</div>

      <app-exercise-log-modal
        [open]="isModalOpen"
        [exercise]="selectedExercise"
        [showExerciseDetails]="true"
        (close)="closeModal()"
        (submitLog)="submitLog($event)"
      ></app-exercise-log-modal>
    </section>
  `,
})
export class ExercisesPageComponent implements OnInit, AfterViewInit, OnDestroy {
  private readonly api = inject(ApiService);
  private observer?: IntersectionObserver;
  private readonly brokenImageIds = new Set<number>();
  private sessionId: number | null = null;

  @ViewChild('scrollAnchor') private readonly scrollAnchor?: ElementRef<HTMLDivElement>;

  muscles: MuscleGroup[] = [];
  exercises: Exercise[] = [];
  visibleExercises: Exercise[] = [];
  selectedExercise: Exercise | null = null;
  selectedMuscle = '';
  hasMore = false;
  isModalOpen = false;
  message = '';
  error = '';

  private readonly pageSize = 12;
  private visibleCount = this.pageSize;

  ngOnInit(): void {
    this.api.getMuscles().subscribe((muscles) => (this.muscles = muscles));
    this.fetchExercises();
  }

  ngAfterViewInit(): void {
    if (!this.scrollAnchor || !('IntersectionObserver' in window)) {
      return;
    }

    this.observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          this.loadMore();
        }
      },
      { root: null, rootMargin: '300px 0px' },
    );

    this.observer.observe(this.scrollAnchor.nativeElement);
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
  }

  selectMuscle(muscleCode: string): void {
    if (this.selectedMuscle === muscleCode) {
      return;
    }
    this.selectedMuscle = muscleCode;
    this.fetchExercises();
  }

  trackByMuscle(_: number, muscle: MuscleGroup): string {
    return muscle.code;
  }

  trackByExercise(_: number, exercise: Exercise): number {
    return exercise.id;
  }

  openAddModal(exercise: Exercise): void {
    this.error = '';
    this.message = '';
    this.selectedExercise = exercise;
    this.isModalOpen = true;
  }

  closeModal(): void {
    this.isModalOpen = false;
  }

  submitLog(payload: ExerciseLogPayload): void {
    this.resolveSession((sessionId) => {
      this.api
        .addExerciseToSession({
          session: sessionId,
          exercise: payload.exerciseId,
          weight_kg: payload.weightKg,
          reps: payload.reps,
          sets: payload.sets,
          notes: payload.notes,
        })
        .subscribe({
          next: () => {
            this.message = 'Exercise added to active session.';
            this.error = '';
            this.isModalOpen = false;
          },
          error: () => {
            this.error = 'Could not add exercise to session.';
            this.message = '';
          },
        });
    });
  }

  imageFor(exercise: Exercise): string {
    if (!exercise.image_url || this.brokenImageIds.has(exercise.id)) {
      return this.placeholderImage(exercise.name);
    }
    return exercise.image_url;
  }

  markImageBroken(exerciseId: number): void {
    this.brokenImageIds.add(exerciseId);
  }

  private fetchExercises(): void {
    this.api.getExercises(this.selectedMuscle || undefined).subscribe({
      next: (exercises) => {
        this.exercises = exercises;
        this.visibleCount = this.pageSize;
        this.updateVisible();
      },
      error: () => {
        this.error = 'Could not load exercises.';
      },
    });
  }

  private loadMore(): void {
    if (!this.hasMore) {
      return;
    }
    this.visibleCount += this.pageSize;
    this.updateVisible();
  }

  private updateVisible(): void {
    this.visibleExercises = this.exercises.slice(0, this.visibleCount);
    this.hasMore = this.visibleExercises.length < this.exercises.length;
  }

  private resolveSession(onReady: (sessionId: number) => void): void {
    if (this.sessionId) {
      onReady(this.sessionId);
      return;
    }

    this.api.getCurrentSession().subscribe({
      next: (session) => {
        if (session.status === 'in_progress') {
          this.sessionId = session.id;
          onReady(session.id);
          return;
        }
        this.createSession(onReady);
      },
      error: (error: HttpErrorResponse) => {
        if (error.status === 404) {
          this.createSession(onReady);
          return;
        }
        this.error = 'Could not verify active session.';
      },
    });
  }

  private createSession(onReady: (sessionId: number) => void): void {
    this.api.startSession().subscribe({
      next: (session) => {
        this.sessionId = session.id;
        onReady(session.id);
      },
      error: () => {
        this.error = 'Could not start a session.';
      },
    });
  }

  private placeholderImage(label: string): string {
    const safeLabel = this.escapeSvgText(label.slice(0, 22));
    return (
      `data:image/svg+xml;utf8,` +
      `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 420 560'>` +
      `<defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'><stop offset='0%' stop-color='%23d7f3ea'/><stop offset='100%' stop-color='%23e6eef9'/></linearGradient></defs>` +
      `<rect width='420' height='560' fill='url(%23g)'/>` +
      `<circle cx='340' cy='80' r='90' fill='%23ffffff55'/>` +
      `<text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' fill='%23183f36' font-size='34' font-family='Segoe UI, sans-serif'>${safeLabel}</text>` +
      `</svg>`
    );
  }

  private escapeSvgText(value: string): string {
    return value
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll("'", '&#39;')
      .replaceAll('"', '&quot;');
  }
}

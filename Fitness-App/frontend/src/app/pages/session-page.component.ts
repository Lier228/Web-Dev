import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit, inject } from '@angular/core';

import { Exercise, MuscleGroup, Session, SessionExercise } from '../core/models/api.models';
import { ApiService } from '../services/api.service';
import { ExerciseLogModalComponent, ExerciseLogPayload } from '../shared/exercise-log-modal.component';
import { LoopCarouselComponent } from '../shared/loop-carousel.component';

interface CategoryItem {
  code: string;
  label: string;
}

const MUSCLE_ORDER = ['chest', 'back', 'biceps', 'triceps', 'quads', 'glutes', 'abs', 'yoga'];

@Component({
  selector: 'app-session-page',
  standalone: true,
  imports: [CommonModule, ExerciseLogModalComponent, LoopCarouselComponent],
  template: `
    <section class="page-stack session-reference">
      <div class="session-hero">
        <button class="session-start" type="button" (click)="startSession()" [disabled]="loading || canEditSession()">START SESSION</button>
        <div class="session-clock">{{ sessionTimerLabel() }}</div>
        <span class="session-points" *ngIf="currentSession">{{ currentSession.points_sum }} PTS</span>
      </div>

      <div class="flash error" *ngIf="error">{{ error }}</div>
      <div class="flash" *ngIf="message">{{ message }}</div>

      <section class="reference-strip" *ngIf="categoryItems.length">
        <ng-template #categorySlide let-item>
          <button class="reference-pill" type="button" [class.active]="selectedMuscle === item.code" (click)="selectMuscle(item.code)">
            {{ item.label }}
          </button>
        </ng-template>

        <app-loop-carousel
          [items]="categoryItems"
          [itemWidth]="154"
          [gap]="12"
          [itemTemplate]="categorySlide"
          ariaLabel="Session categories"
        ></app-loop-carousel>
      </section>

      <section class="reference-strip" *ngIf="exercises.length; else emptyExercises">
        <div class="strip-head">
          <div>
            <h1 class="reference-title">SESSION</h1>
            <p class="reference-subtitle">Pick an exercise card and log it into the active session.</p>
          </div>
          <button class="reference-action" type="button" (click)="openCurrentExercise()">ADD EXERCISE</button>
        </div>

        <ng-template #exerciseSlide let-item>
          <article class="exercise-rail-card" (click)="openAddModal(item)">
            <div class="exercise-rail-media">
              <img [src]="imageFor(item)" [alt]="item.name" (error)="markImageBroken(item.id)" />
            </div>
            <div class="exercise-rail-meta">
              <strong>{{ item.name }}</strong>
              <span>{{ item.exercise_type }}</span>
            </div>
          </article>
        </ng-template>

        <app-loop-carousel
          [items]="exercises"
          [itemWidth]="188"
          [gap]="14"
          [itemTemplate]="exerciseSlide"
          ariaLabel="Session exercise picker"
        ></app-loop-carousel>
      </section>

      <ng-template #emptyExercises>
        <section class="reference-empty">
          <h2>NO EXERCISES</h2>
          <p>There are no exercise cards in this category yet.</p>
        </section>
      </ng-template>

      <section class="session-log" *ngIf="items.length; else emptyLog">
        <div class="strip-head">
          <div>
            <h2 class="reference-title reference-title--small">SESSION LOG</h2>
            <p class="reference-subtitle">Everything already added to the current workout.</p>
          </div>
          <button class="reference-action reference-action--ghost" type="button" *ngIf="canEditSession()" (click)="finishSession()">FINISH</button>
        </div>

        <div class="session-list session-list--reference">
          <div class="session-item session-item--reference" *ngFor="let item of items; trackBy: trackByItem">
            <div>
              <strong>{{ item.exercise_name }}</strong>
              <div class="muted">{{ item.weight_kg }} kg - {{ item.reps }} reps - {{ item.sets }} sets</div>
            </div>
            <button class="reference-mini" type="button" *ngIf="canEditSession()" (click)="removeItem(item.id)">DELETE</button>
          </div>
        </div>
      </section>

      <ng-template #emptyLog>
        <section class="reference-empty reference-empty--short">
          <h2>{{ canEditSession() ? 'ADD EXERCISE' : 'START SESSION' }}</h2>
          <p>{{ canEditSession() ? 'Pick a card above and log the first exercise.' : 'Start a session to begin logging your workout.' }}</p>
        </section>
      </ng-template>

      <app-exercise-log-modal
        [open]="isModalOpen"
        [exercise]="selectedExercise()"
        [showExerciseDetails]="true"
        [showGalleryNav]="exercises.length > 1"
        (previous)="showPreviousExercise()"
        (next)="showNextExercise()"
        (close)="closeModal()"
        (submitLog)="addExerciseToSession($event)"
      ></app-exercise-log-modal>
    </section>
  `,
  styles: [
    `
      .session-reference {
        gap: 22px;
      }

      .session-hero,
      .reference-strip,
      .session-log,
      .reference-empty {
        border-radius: 22px;
        background: rgba(8, 8, 8, 0.94);
        border: 1px solid rgba(255, 255, 255, 0.08);
        box-shadow: 0 18px 40px rgba(0, 0, 0, 0.3);
      }

      .session-hero,
      .reference-title,
      .reference-pill,
      .reference-action,
      .reference-mini,
      .session-start,
      .session-clock,
      .session-points {
        font-family: 'Orbitron', 'Arial Narrow', Arial, sans-serif;
      }

      .session-hero {
        padding: 20px 24px;
        display: flex;
        flex-wrap: wrap;
        gap: 18px;
        align-items: center;
      }

      .session-start,
      .reference-action {
        min-height: 64px;
        border: none;
        border-radius: 16px;
        padding: 0 28px;
        background: linear-gradient(180deg, #d81c25, #8f1015);
        color: #f5f5f5;
        letter-spacing: 0.08em;
        cursor: pointer;
      }

      .session-start:disabled {
        opacity: 0.68;
        cursor: default;
      }

      .session-clock {
        font-size: clamp(1.6rem, 4vw, 2.2rem);
        letter-spacing: 0.14em;
        color: #f3f3f3;
      }

      .session-points {
        margin-left: auto;
        padding: 10px 14px;
        border-radius: 999px;
        background: rgba(255, 255, 255, 0.08);
        color: #f2f2f2;
        letter-spacing: 0.08em;
      }

      .reference-strip,
      .session-log {
        padding: 16px;
      }

      .strip-head {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        gap: 14px;
        margin-bottom: 14px;
      }

      .reference-title {
        font-size: clamp(1.8rem, 4vw, 2.6rem);
        letter-spacing: 0.12em;
        color: #f3f3f3;
      }

      .reference-title--small {
        font-size: 1.4rem;
      }

      .reference-subtitle {
        margin-top: 6px;
        color: rgba(255, 255, 255, 0.68);
        line-height: 1.55;
      }

      .reference-pill {
        width: 100%;
        height: 56px;
        border: none;
        border-radius: 12px;
        background: linear-gradient(180deg, #e1222c, #9f1016);
        color: #f2f2f2;
        font-size: 1rem;
        letter-spacing: 0.08em;
        cursor: pointer;
      }

      .reference-pill.active {
        background: linear-gradient(180deg, #fb3742, #be141d);
        box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.08) inset;
      }

      .reference-action--ghost,
      .reference-mini {
        background: rgba(255, 255, 255, 0.08);
      }

      .reference-mini {
        min-height: 42px;
        padding: 0 18px;
        border: none;
        border-radius: 12px;
        color: #f5f5f5;
        letter-spacing: 0.08em;
        cursor: pointer;
      }

      .exercise-rail-card {
        height: 228px;
        border-radius: 12px;
        overflow: hidden;
        cursor: pointer;
        background:
          linear-gradient(145deg, rgba(255, 255, 255, 0.14), transparent 35%),
          linear-gradient(325deg, rgba(255, 255, 255, 0.1), transparent 40%),
          linear-gradient(180deg, #d11620, #7a0d13);
        border: 1px solid rgba(255, 255, 255, 0.08);
        box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.08);
        padding: 10px;
        display: grid;
        grid-template-rows: 126px auto;
        gap: 10px;
      }

      .exercise-rail-media {
        border-radius: 10px;
        overflow: hidden;
        background: #0c0c0c;
      }

      .exercise-rail-media img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
      }

      .exercise-rail-meta {
        display: grid;
        gap: 6px;
        color: #f3f3f3;
        text-transform: uppercase;
      }

      .exercise-rail-meta strong {
        font-size: 0.82rem;
        line-height: 1.2;
      }

      .exercise-rail-meta span {
        color: rgba(255, 255, 255, 0.72);
        font-size: 0.7rem;
        letter-spacing: 0.08em;
      }

      .session-list--reference {
        gap: 12px;
      }

      .session-item--reference {
        border-radius: 16px;
        background: linear-gradient(180deg, rgba(216, 28, 37, 0.14), rgba(255, 255, 255, 0.02));
      }

      .reference-empty {
        min-height: 240px;
        display: grid;
        place-items: center;
        gap: 8px;
        text-align: center;
      }

      .reference-empty--short {
        min-height: 180px;
      }

      .reference-empty h2 {
        color: #f3f3f3;
        letter-spacing: 0.12em;
      }

      .reference-empty p {
        color: rgba(255, 255, 255, 0.66);
      }

      @media (max-width: 860px) {
        .session-points {
          margin-left: 0;
        }

        .strip-head {
          flex-direction: column;
        }
      }
    `,
  ],
})
export class SessionPageComponent implements OnInit, OnDestroy {
  private readonly api = inject(ApiService);
  private readonly brokenImageIds = new Set<number>();
  private timerHandle: ReturnType<typeof setInterval> | null = null;

  currentSession: Session | null = null;
  muscles: MuscleGroup[] = [];
  exercises: Exercise[] = [];
  items: SessionExercise[] = [];
  categoryItems: CategoryItem[] = [];
  selectedMuscle = '';
  selectedExerciseIndex = -1;
  isModalOpen = false;
  loading = false;
  error = '';
  message = '';
  now = Date.now();

  ngOnInit(): void {
    this.loadMuscles();
    this.loadCurrentSession();
    this.timerHandle = setInterval(() => {
      this.now = Date.now();
    }, 1000);
  }

  ngOnDestroy(): void {
    if (this.timerHandle) {
      clearInterval(this.timerHandle);
    }
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
        this.message = '';
      },
      complete: () => {
        this.loading = false;
      },
    });
  }

  selectMuscle(muscleCode: string): void {
    if (this.selectedMuscle === muscleCode) {
      return;
    }

    this.selectedMuscle = muscleCode;
    this.fetchExercises();
  }

  openAddModal(exercise: Exercise): void {
    if (!this.canEditSession()) {
      this.message = '';
      this.error = 'Start a session first.';
      return;
    }

    const index = this.exercises.findIndex((item) => item.id === exercise.id);
    if (index === -1) {
      return;
    }

    this.selectedExerciseIndex = index;
    this.isModalOpen = true;
    this.error = '';
  }

  openCurrentExercise(): void {
    const current = this.selectedExercise();
    if (current) {
      this.openAddModal(current);
    }
  }

  closeModal(): void {
    this.isModalOpen = false;
  }

  showNextExercise(): void {
    if (this.exercises.length < 2 || this.selectedExerciseIndex === -1) {
      return;
    }

    this.selectedExerciseIndex = (this.selectedExerciseIndex + 1) % this.exercises.length;
  }

  showPreviousExercise(): void {
    if (this.exercises.length < 2 || this.selectedExerciseIndex === -1) {
      return;
    }

    this.selectedExerciseIndex = (this.selectedExerciseIndex - 1 + this.exercises.length) % this.exercises.length;
  }

  selectedExercise(): Exercise | null {
    if (this.selectedExerciseIndex < 0 || this.selectedExerciseIndex >= this.exercises.length) {
      return null;
    }

    return this.exercises[this.selectedExerciseIndex];
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
          this.message = 'Exercise added to session.';
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
        this.error = '';
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

  sessionTimerLabel(): string {
    if (!this.currentSession?.start_time || !this.canEditSession()) {
      return '00:00';
    }

    const start = Date.parse(this.currentSession.start_time);
    if (Number.isNaN(start)) {
      return '00:00';
    }

    const elapsedSeconds = Math.max(0, Math.floor((this.now - start) / 1000));
    const minutes = Math.floor(elapsedSeconds / 60);
    const seconds = elapsedSeconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }

  imageFor(exercise: Exercise): string {
    if (exercise.image_url && !this.brokenImageIds.has(exercise.id)) {
      return exercise.image_url;
    }

    const videoId = this.youtubeId(exercise.video_url);
    if (videoId && !this.brokenImageIds.has(exercise.id)) {
      return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
    }

    return this.placeholderImage(exercise.name);
  }

  markImageBroken(exerciseId: number): void {
    this.brokenImageIds.add(exerciseId);
  }

  private loadMuscles(): void {
    this.api.getMuscles().subscribe({
      next: (muscles) => {
        this.muscles = this.sortMuscles(muscles);
        this.categoryItems = this.muscles.map((muscle) => ({
          code: muscle.code,
          label: muscle.name.toUpperCase(),
        }));
        if (!this.selectedMuscle && this.categoryItems.length) {
          this.selectedMuscle = this.categoryItems[0].code;
        }
        this.fetchExercises();
      },
      error: () => {
        this.error = 'Failed to load categories.';
      },
    });
  }

  private fetchExercises(): void {
    if (!this.selectedMuscle) {
      return;
    }

    this.api.getExercises(this.selectedMuscle).subscribe({
      next: (exercises) => {
        this.exercises = exercises;
        this.selectedExerciseIndex = exercises.length ? 0 : -1;
      },
      error: () => {
        this.error = 'Failed to load exercise cards.';
      },
    });
  }

  private loadCurrentSession(): void {
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

  private loadItems(): void {
    if (!this.currentSession) {
      this.items = [];
      return;
    }

    this.api.getSessionExercises(this.currentSession.id).subscribe((items) => {
      this.items = items;
    });
  }

  private sortMuscles(muscles: MuscleGroup[]): MuscleGroup[] {
    return [...muscles].sort((left, right) => {
      const leftIndex = MUSCLE_ORDER.indexOf(left.code);
      const rightIndex = MUSCLE_ORDER.indexOf(right.code);
      const normalizedLeft = leftIndex === -1 ? Number.MAX_SAFE_INTEGER : leftIndex;
      const normalizedRight = rightIndex === -1 ? Number.MAX_SAFE_INTEGER : rightIndex;
      return normalizedLeft - normalizedRight || left.name.localeCompare(right.name);
    });
  }

  private youtubeId(videoUrl: string): string | null {
    if (!videoUrl) {
      return null;
    }

    try {
      const parsed = new URL(videoUrl);
      const host = parsed.hostname.toLowerCase();

      if (host.includes('youtu.be')) {
        return parsed.pathname.slice(1) || null;
      }

      if (host.includes('youtube.com')) {
        const direct = parsed.searchParams.get('v');
        if (direct) {
          return direct;
        }

        const segments = parsed.pathname.split('/').filter(Boolean);
        const embedIndex = segments.indexOf('embed');
        if (embedIndex >= 0) {
          return segments[embedIndex + 1] ?? null;
        }
      }
    } catch {
      return null;
    }

    return null;
  }

  private placeholderImage(label: string): string {
    const safeLabel = this.escapeSvgText(label.slice(0, 20));
    return (
      `data:image/svg+xml;utf8,` +
      `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 420 560'>` +
      `<defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'><stop offset='0%' stop-color='%23191818'/><stop offset='100%' stop-color='%23d01620'/></linearGradient></defs>` +
      `<rect width='420' height='560' fill='url(%23g)'/>` +
      `<path d='M0 520 L420 300 L420 560 L0 560 Z' fill='%23070707' opacity='0.42'/>` +
      `<text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' fill='%23f8f8f8' font-size='32' font-family='Segoe UI, sans-serif'>${safeLabel}</text>` +
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

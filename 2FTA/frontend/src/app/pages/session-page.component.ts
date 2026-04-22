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
        <button 
          *ngIf="!currentSession" 
          class="session-start" 
          type="button" 
          (click)="startSession()" 
          [disabled]="loading">
          START SESSION
        </button>

        <ng-container *ngIf="currentSession && canEditSession()">
          <div class="session-controls">
            <button class="control-btn" (click)="togglePause()">
              {{ isPaused ? 'RESUME' : 'PAUSE' }}
            </button>
            <button class="control-btn control-btn--finish" (click)="finishSession()">
              FINISH
            </button>
            <button class="control-btn control-btn--ghost" (click)="cancelSession()">
              CANCEL
            </button>
          </div>
        </ng-container>

        <div class="session-clock" [class.paused]="isPaused">{{ sessionTimerLabel() }}</div>
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
        <app-loop-carousel [items]="categoryItems" [itemWidth]="154" [gap]="12" [itemTemplate]="categorySlide"></app-loop-carousel>
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

        <app-loop-carousel [items]="exercises" [itemWidth]="188" [gap]="14" [itemTemplate]="exerciseSlide"></app-loop-carousel>
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
        (close)="closeModal()"
        (submitLog)="addExerciseToSession($event)"
      ></app-exercise-log-modal>
    </section>
  `,
  styles: [`
    .session-reference { gap: 22px; }
    .session-hero, .reference-strip, .session-log, .reference-empty {
      border-radius: 22px; background: rgba(8, 8, 8, 0.94);
      border: 1px solid rgba(255, 255, 255, 0.08); box-shadow: 0 18px 40px rgba(0, 0, 0, 0.3);
    }
    p{font-family: 'Saira', sans-serif;}
    .session-hero, .reference-title, .session-clock, .session-start { font-family: 'Orbitron', sans-serif; }
    .session-hero { padding: 20px 24px; display: flex; flex-wrap: wrap; gap: 18px; align-items: center; }
    .session-start, .reference-action {
      min-height: 64px; border: none; border-radius: 16px; padding: 0 28px;
      background: linear-gradient(180deg, #d81c25, #8f1015); color: #f5f5f5; cursor: pointer;
    }
    .exercise-rail-meta {
      padding-top: 8px;
      display: flex !important;
      flex-direction: column !important;
      align-items: flex-start !important;
      gap: 2px;
      overflow: hidden;
    }
    .session-clock { font-size: 2rem; letter-spacing: 0.14em; color: #f3f3f3; }
    .session-clock.paused { color: #ffcc00; animation: blink 1s infinite; }
    @keyframes blink { 50% { opacity: 0.5; } }
    .session-controls { display: flex; gap: 10px; }
    .control-btn {
      min-height: 50px; padding: 0 20px; border-radius: 12px;
      border: 1px solid rgba(255, 255, 255, 0.2); background: rgba(255, 255, 255, 0.05);
      color: #fff; cursor: pointer; font-size: 0.8rem;
    }
    .control-btn--finish { background: linear-gradient(180deg, #d81c25, #8f1015); border: none; }
    .control-btn--ghost { border: none; color: rgba(255, 255, 255, 0.5); }
    .session-points { margin-left: auto; padding: 10px 14px; border-radius: 999px; background: rgba(255, 255, 255, 0.08); }
    .reference-strip, .session-log { padding: 16px; }
    .strip-head { display: flex; justify-content: space-between; margin-bottom: 14px; }
    .reference-pill { width: 100%; height: 56px; border: none; border-radius: 12px; background: #333; color: #fff; cursor: pointer; }
    .reference-pill.active { background: #d81c25; }
    .exercise-rail-card { height: 228px; border-radius: 12px; background: #1a1a1a; padding: 10px; cursor: pointer; }
    .exercise-rail-media { height: 126px; background: #000; border-radius: 10px; overflow: hidden; }
    .exercise-rail-media img { width: 100%; height: 100%; object-fit: cover; }
    .session-item--reference { padding: 12px; margin-bottom: 8px; border-radius: 12px; background: rgba(255,255,255,0.05); display: flex; justify-content: space-between; }
  `]
})
export class SessionPageComponent implements OnInit, OnDestroy {
  private readonly api = inject(ApiService);
  private readonly brokenImageIds = new Set<number>();
  private timerHandle: any = null;

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

  // Состояние паузы
  isPaused = false;
  accumulatedTime = 0;
  pauseStartTime: number | null = null;

  ngOnInit(): void {
    this.loadMuscles();
    this.loadCurrentSession();
    this.timerHandle = setInterval(() => {
      this.now = Date.now();
    }, 1000);
  }

  ngOnDestroy(): void {
    if (this.timerHandle) clearInterval(this.timerHandle);
  }


  startSession(): void {
    this.loading = true;
    this.api.startSession().subscribe({
      next: (session) => {
        this.currentSession = session;
        this.isPaused = false;
        this.accumulatedTime = 0;
        this.pauseStartTime = null;
        this.loadItems();
      },
      error: () => (this.error = 'Failed to start'),
      complete: () => (this.loading = false)
    });
  }

  togglePause(): void {
    this.isPaused = !this.isPaused;
    if (this.isPaused) {
      this.pauseStartTime = this.now;
    } else if (this.pauseStartTime) {
      this.accumulatedTime += (this.now - this.pauseStartTime);
      this.pauseStartTime = null;
    }
  }

  finishSession(): void {
    if (!this.currentSession) return;
    this.api.finishSession(this.currentSession.id).subscribe({
      next: (session) => {
        this.currentSession = session;
        this.items = [];
        this.message = 'Finished!';
      }
    });
  }

  cancelSession(): void {
    if (confirm('Cancel session? Progress lost.')) {
      this.currentSession = null;
      this.items = [];
      this.isPaused = false;
    }
  }

  sessionTimerLabel(): string {
    if (!this.currentSession?.start_time || !this.canEditSession()) return '00:00';
    
    const start = Date.parse(this.currentSession.start_time);
    let elapsedMs = this.now - start - this.accumulatedTime;
    
    if (this.isPaused && this.pauseStartTime) {
      elapsedMs -= (this.now - this.pauseStartTime);
    }

    const sec = Math.max(0, Math.floor(elapsedMs / 1000));
    return `${String(Math.floor(sec / 60)).padStart(2, '0')}:${String(sec % 60).padStart(2, '0')}`;
  }


  selectMuscle(code: string): void {
    this.selectedMuscle = code;
    this.fetchExercises();
  }

  openAddModal(ex: Exercise): void {
    if (!this.canEditSession()) { this.error = 'Start session first'; return; }
    this.selectedExerciseIndex = this.exercises.indexOf(ex);
    this.isModalOpen = true;
  }

  selectedExercise() { return this.exercises[this.selectedExerciseIndex] || null; }

  addExerciseToSession(payload: ExerciseLogPayload): void {
    if (!this.currentSession) return;
    this.api.addExerciseToSession({
      session: this.currentSession.id,
      exercise: payload.exerciseId,
      weight_kg: payload.weightKg,
      reps: payload.reps,
      sets: payload.sets,
      notes: payload.notes
    }).subscribe(() => {
      this.isModalOpen = false;
      this.loadItems();
      this.loadCurrentSession();
    });
  }

  removeItem(id: number) { this.api.deleteSessionExercise(id).subscribe(() => this.loadItems()); }
  canEditSession() { return this.currentSession?.status === 'in_progress'; }
  trackByItem(_: number, item: any) { return item.id; }
  closeModal() { this.isModalOpen = false; }
  openCurrentExercise() { if (this.selectedExercise()) this.openAddModal(this.selectedExercise()!); }

  imageFor(ex: Exercise) { return ex.image_url || `https://img.youtube.com/vi/${this.youtubeId(ex.video_url)}/hqdefault.jpg`; }
  markImageBroken(id: number) { this.brokenImageIds.add(id); }

  private loadMuscles() {
    this.api.getMuscles().subscribe(m => {
      this.muscles = m;
      this.categoryItems = m.map(x => ({ code: x.code, label: x.name.toUpperCase() }));
      this.selectedMuscle = m[0]?.code;
      this.fetchExercises();
    });
  }

  private fetchExercises() {
    this.api.getExercises(this.selectedMuscle).subscribe(e => this.exercises = e);
  }

  private loadCurrentSession() {
    this.api.getCurrentSession().subscribe(s => { this.currentSession = s; this.loadItems(); });
  }

  private loadItems() {
    if (this.currentSession) this.api.getSessionExercises(this.currentSession.id).subscribe(i => this.items = i);
  }

  private youtubeId(url: string): string {
    return url?.includes('v=') ? url.split('v=')[1]?.split('&')[0] : '';
  }
}
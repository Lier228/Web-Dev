import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Component, OnInit, inject } from '@angular/core';

import { Exercise, MuscleGroup } from '../core/models/api.models';
import { ApiService } from '../services/api.service';
import { LoopCarouselComponent } from '../shared/loop-carousel.component';

interface CategoryItem {
  code: string;
  label: string;
}

const MUSCLE_ORDER = ['chest', 'back', 'biceps', 'triceps', 'shoulders', 'forearm', 'quads', 'glutes', 'hamstrings', 'calves', 'abs', 'yoga'];

@Component({
  selector: 'app-exercises-page',
  standalone: true,
  imports: [CommonModule, LoopCarouselComponent],
  template: `
    <section class="page-stack exercise-reference">
      <div class="page-head exercise-head">
        <div>
          <h1 class="reference-title">EXERCISE</h1>
          <p class="reference-subtitle">Technique clips and YouTube walkthroughs grouped by the backend exercise categories.</p>
        </div>
        <span class="reference-counter">{{ exercises.length }} VIDEOS</span>
      </div>

      <div class="flash error" *ngIf="error">{{ error }}</div>

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
          ariaLabel="Exercise categories"
        ></app-loop-carousel>
      </section>

      <section class="video-stage" *ngIf="selectedExercise() as exercise; else emptyState">
        <div class="video-player-shell">
          <iframe
            class="video-frame"
            [src]="safeVideoUrl(exercise)"
            [title]="exercise.name"
            loading="lazy"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowfullscreen
          ></iframe>
        </div>

        <aside class="video-summary">
          <span class="video-kicker">{{ primaryMuscle(exercise) }}</span>
          <h2>{{ exercise.name }}</h2>
          <p>{{ exercise.description || 'Open a technique clip and keep your form clean before you log it in session.' }}</p>

          <div class="video-meta">
            <div>
              <span>TYPE</span>
              <strong>{{ exercise.exercise_type }}</strong>
            </div>
            <div>
              <span>COEFF</span>
              <strong>{{ exercise.base_coefficient }}</strong>
            </div>
          </div>

          <div class="video-muscles">
            <span class="video-tag" *ngFor="let group of exercise.exercise_muscles">
              {{ group.muscle_group.name }}
            </span>
          </div>

          <a class="video-link" [href]="exercise.video_url" target="_blank" rel="noopener noreferrer">OPEN ON YOUTUBE</a>
        </aside>
      </section>

      <ng-template #emptyState>
        <section class="reference-empty">
          <h2>NO CLIPS</h2>
          <p>There are no exercises in this category yet.</p>
        </section>
      </ng-template>

      <section class="video-list" *ngIf="exercises.length">
        <button
          class="video-row"
          type="button"
          *ngFor="let exercise of exercises; let index = index"
          [class.active]="selectedExerciseIndex === index"
          (click)="selectExercise(index)"
        >
          <div class="video-thumb">
            <img [src]="thumbnailFor(exercise)" [alt]="exercise.name" (error)="markImageBroken(exercise.id)" />
          </div>

          <div class="video-copy">
            <strong>{{ exercise.name }}</strong>
            <span>{{ exercise.description || exercise.exercise_type }}</span>
          </div>

          <span class="video-type">{{ exercise.exercise_type }}</span>
        </button>
      </section>
    </section>
  `,
  styles: [
    `
      .exercise-reference {
        gap: 22px;
      }

      .exercise-head {
        align-items: flex-start;
      }

      .reference-title,
      .reference-pill,
      .reference-counter,
      .video-kicker,
      .video-link,
      .video-type {
        font-family: 'Orbitron', 'Arial Narrow', Arial, sans-serif;
      }

      .reference-title {
        font-size: clamp(2rem, 4vw, 3rem);
        letter-spacing: 0.12em;
        color: #f3f3f3;
      }

      .reference-subtitle {
        margin-top: 8px;
        max-width: 700px;
        color: rgba(255, 255, 255, 0.68);
        line-height: 1.55;
      }

      .reference-counter {
        display: inline-flex;
        align-items: center;
        min-height: 48px;
        padding: 0 18px;
        border-radius: 14px;
        background: linear-gradient(180deg, #d81c25, #8f1015);
        color: #f6f6f6;
        letter-spacing: 0.08em;
      }

      .reference-strip {
        padding: 12px 16px;
        border-radius: 18px;
        background: rgba(10, 10, 10, 0.92);
        border: 1px solid rgba(255, 255, 255, 0.08);
        box-shadow: 0 18px 40px rgba(0, 0, 0, 0.28);
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

      .video-stage {
        display: grid;
        grid-template-columns: minmax(0, 1.35fr) minmax(320px, 0.9fr);
        gap: 18px;
      }

      .video-player-shell,
      .video-summary,
      .video-list {
        border-radius: 22px;
        background: rgba(8, 8, 8, 0.94);
        border: 1px solid rgba(255, 255, 255, 0.08);
        box-shadow: 0 18px 40px rgba(0, 0, 0, 0.3);
      }

      .video-player-shell {
        padding: 16px;
      }

      .video-frame {
        width: 100%;
        aspect-ratio: 16 / 9;
        border: none;
        border-radius: 18px;
        background: #000000;
      }

      .video-summary {
        padding: 22px;
        display: grid;
        gap: 18px;
        align-content: start;
      }

      .video-kicker {
        color: #ff5c64;
        font-size: 0.88rem;
        letter-spacing: 0.16em;
      }

      .video-summary h2 {
        font-size: clamp(1.5rem, 2vw, 2rem);
        letter-spacing: 0.04em;
        color: #f2f2f2;
      }

      .video-summary p {
        color: rgba(255, 255, 255, 0.74);
        line-height: 1.6;
      }

      .video-meta {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 12px;
      }

      .video-meta div {
        border-radius: 14px;
        padding: 14px;
        background: linear-gradient(180deg, rgba(217, 28, 37, 0.18), rgba(255, 255, 255, 0.04));
      }

      .video-meta span {
        display: block;
        margin-bottom: 6px;
        color: rgba(255, 255, 255, 0.56);
        font-size: 0.75rem;
        letter-spacing: 0.14em;
      }

      .video-meta strong {
        color: #ffffff;
        text-transform: uppercase;
      }

      .video-muscles {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
      }

      .video-tag {
        padding: 8px 12px;
        border-radius: 999px;
        background: rgba(216, 28, 37, 0.18);
        color: #f5f5f5;
        font-size: 0.85rem;
      }

      .video-link {
        display: inline-flex;
        justify-content: center;
        align-items: center;
        min-height: 54px;
        padding: 0 18px;
        border-radius: 14px;
        background: linear-gradient(180deg, #d81c25, #8b1015);
        color: #f7f7f7;
        text-decoration: none;
        letter-spacing: 0.08em;
      }

      .video-list {
        padding: 10px;
        display: grid;
        gap: 10px;
      }

      .video-row {
        border: none;
        width: 100%;
        display: grid;
        grid-template-columns: 180px 1fr auto;
        gap: 14px;
        align-items: center;
        padding: 10px;
        border-radius: 18px;
        background: transparent;
        color: #f4f4f4;
        cursor: pointer;
        text-align: left;
      }

      .video-row.active {
        background: linear-gradient(90deg, rgba(216, 28, 37, 0.24), rgba(216, 28, 37, 0.08));
      }

      .video-thumb {
        overflow: hidden;
        border-radius: 14px;
        background: #111111;
        aspect-ratio: 16 / 9;
      }

      .video-thumb img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
      }

      .video-copy {
        display: grid;
        gap: 8px;
      }

      .video-copy strong {
        font-size: 1.05rem;
        line-height: 1.35;
      }

      .video-copy span {
        color: rgba(255, 255, 255, 0.68);
        line-height: 1.5;
      }

      .video-type {
        padding: 8px 12px;
        border-radius: 999px;
        background: rgba(255, 255, 255, 0.08);
        color: #f4f4f4;
        font-size: 0.8rem;
        letter-spacing: 0.08em;
        text-transform: uppercase;
      }

      .reference-empty {
        min-height: 240px;
        border-radius: 22px;
        background: rgba(8, 8, 8, 0.94);
        border: 1px solid rgba(255, 255, 255, 0.08);
        display: grid;
        place-items: center;
        gap: 8px;
        text-align: center;
      }

      .reference-empty h2 {
        font-family: 'Orbitron', 'Arial Narrow', Arial, sans-serif;
        letter-spacing: 0.12em;
      }

      .reference-empty p {
        color: rgba(255, 255, 255, 0.66);
      }

      @media (max-width: 1080px) {
        .video-stage {
          grid-template-columns: 1fr;
        }
      }

      @media (max-width: 760px) {
        .video-row {
          grid-template-columns: 1fr;
        }

        .video-type {
          justify-self: flex-start;
        }
      }
    `,
  ],
})
export class ExercisesPageComponent implements OnInit {
  private readonly api = inject(ApiService);
  private readonly sanitizer = inject(DomSanitizer);
  private readonly brokenImageIds = new Set<number>();

  muscles: MuscleGroup[] = [];
  exercises: Exercise[] = [];
  categoryItems: CategoryItem[] = [];
  selectedMuscle = '';
  selectedExerciseIndex = -1;
  error = '';

  ngOnInit(): void {
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
        this.error = 'Could not load exercise categories.';
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

  selectExercise(index: number): void {
    this.selectedExerciseIndex = index;
  }

  selectedExercise(): Exercise | null {
    if (this.selectedExerciseIndex < 0 || this.selectedExerciseIndex >= this.exercises.length) {
      return null;
    }

    return this.exercises[this.selectedExerciseIndex];
  }

  safeVideoUrl(exercise: Exercise): SafeResourceUrl {
    const videoId = this.youtubeId(exercise.video_url);
    const embedUrl = videoId
      ? `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1`
      : 'about:blank';
    return this.sanitizer.bypassSecurityTrustResourceUrl(embedUrl);
  }

  thumbnailFor(exercise: Exercise): string {
    const videoId = this.youtubeId(exercise.video_url);
    if (videoId && !this.brokenImageIds.has(exercise.id)) {
      return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
    }

    if (exercise.image_url && !this.brokenImageIds.has(exercise.id)) {
      return exercise.image_url;
    }

    return this.placeholderImage(exercise.name);
  }

  markImageBroken(exerciseId: number): void {
    this.brokenImageIds.add(exerciseId);
  }

  primaryMuscle(exercise: Exercise): string {
    const primary = exercise.exercise_muscles.find((group) => group.is_primary)?.muscle_group.name;
    if (primary) {
      return primary.toUpperCase();
    }

    return exercise.target_muscle ? exercise.target_muscle.replaceAll('_', ' ').toUpperCase() : 'GUIDE';
  }

  private fetchExercises(): void {
    if (!this.selectedMuscle) {
      return;
    }

    this.api.getExercises(this.selectedMuscle).subscribe({
      next: (exercises) => {
        this.exercises = exercises;
        this.selectedExerciseIndex = exercises.length ? 0 : -1;
        this.error = '';
      },
      error: () => {
        this.error = 'Could not load exercise videos.';
      },
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
      `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 640 360'>` +
      `<defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'><stop offset='0%' stop-color='%23c71923'/><stop offset='100%' stop-color='%23090909'/></linearGradient></defs>` +
      `<rect width='640' height='360' fill='url(%23g)'/>` +
      `<path d='M0 250 L640 110 L640 360 L0 360 Z' fill='%23ffffff14'/>` +
      `<text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' fill='%23f5f5f5' font-size='34' font-family='Segoe UI, sans-serif'>${safeLabel}</text>` +
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

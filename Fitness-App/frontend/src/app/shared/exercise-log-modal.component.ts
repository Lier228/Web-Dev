import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { Exercise } from '../core/models/api.models';

export interface ExerciseLogPayload {
  exerciseId: number;
  weightKg: number;
  reps: number;
  sets: number;
  notes: string;
}

@Component({
  selector: 'app-exercise-log-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="modal-backdrop" *ngIf="open" (click)="close.emit()">
      <div class="modal-card" (click)="$event.stopPropagation()">
        <img class="modal-image" [src]="activeImage()" [alt]="activeExercise()?.name || 'Exercise'" (error)="usePlaceholder = true" />

        <div class="modal-content">
          <div class="page-head">
            <div>
              <h2>{{ activeExercise()?.name || 'Add Exercise' }}</h2>
              <div class="muted">{{ showExerciseDetails ? 'Exercise details + quick log.' : 'Log the set in a few seconds.' }}</div>
            </div>
            <div class="toolbar">
              <button class="btn secondary" type="button" *ngIf="showGalleryNav" (click)="previous.emit()">Previous</button>
              <button class="btn secondary" type="button" *ngIf="showGalleryNav" (click)="next.emit()">Next</button>
              <button class="btn secondary" type="button" (click)="close.emit()">Close</button>
            </div>
          </div>

          <label class="field" *ngIf="allowExercisePicker">
            <span>Exercise</span>
            <select [(ngModel)]="selectedExerciseId" name="selectedExerciseId">
              <option [ngValue]="null">Choose exercise</option>
              <option *ngFor="let item of exercises" [ngValue]="item.id">{{ item.name }}</option>
            </select>
          </label>

          <div class="exercise-facts" *ngIf="showExerciseDetails && activeExercise() as item">
            <p class="muted">{{ item.description || 'No description provided.' }}</p>
            <div class="facts-grid">
              <div class="fact-row"><span class="muted">Type</span><strong>{{ item.exercise_type }}</strong></div>
              <div class="fact-row"><span class="muted">Base coeff.</span><strong>{{ item.base_coefficient }}</strong></div>
            </div>
            <div class="toolbar">
              <span class="badge" *ngFor="let group of item.exercise_muscles">
                {{ group.muscle_group.name }} {{ group.contribution_percent }}%
              </span>
            </div>
          </div>

          <div class="modal-grid">
            <label class="field">
              <span>Weight (kg)</span>
              <input type="number" min="0" step="0.5" name="weight_kg" [(ngModel)]="weightKg" />
            </label>

            <label class="field">
              <span>Reps</span>
              <input type="number" min="1" name="reps" [(ngModel)]="reps" />
            </label>

            <label class="field">
              <span>Sets</span>
              <input type="number" min="1" name="sets" [(ngModel)]="sets" />
            </label>
          </div>

          <label class="field">
            <span>Notes (optional)</span>
            <textarea rows="3" name="notes" [(ngModel)]="notes" placeholder="Technique, rest, effort..."></textarea>
          </label>

          <div class="toolbar">
            <button class="btn" type="button" (click)="submitForm()">Add to Session</button>
            <button class="btn secondary" type="button" (click)="reset()">Reset</button>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class ExerciseLogModalComponent implements OnChanges {
  @Input() open = false;
  @Input() exercise: Exercise | null = null;
  @Input() exercises: Exercise[] = [];
  @Input() allowExercisePicker = false;
  @Input() showExerciseDetails = false;
  @Input() showGalleryNav = false;

  @Output() close = new EventEmitter<void>();
  @Output() submitLog = new EventEmitter<ExerciseLogPayload>();
  @Output() previous = new EventEmitter<void>();
  @Output() next = new EventEmitter<void>();

  selectedExerciseId: number | null = null;
  weightKg = 20;
  reps = 10;
  sets = 3;
  notes = '';
  usePlaceholder = false;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['open']?.currentValue) {
      this.selectedExerciseId = this.exercise?.id ?? null;
      this.usePlaceholder = false;
    }
  }

  activeExercise(): Exercise | null {
    if (this.allowExercisePicker) {
      return this.exercises.find((item) => item.id === this.selectedExerciseId) ?? null;
    }
    return this.exercise;
  }

  activeImage(): string {
    const current = this.activeExercise();
    if (!current || !current.image_url || this.usePlaceholder) {
      return this.svgPlaceholder(current?.name ?? 'Exercise');
    }
    return current.image_url;
  }

  submitForm(): void {
    const currentExercise = this.activeExercise();
    if (!currentExercise) {
      return;
    }

    this.submitLog.emit({
      exerciseId: currentExercise.id,
      weightKg: this.weightKg,
      reps: this.reps,
      sets: this.sets,
      notes: this.notes.trim(),
    });
  }

  reset(): void {
    this.weightKg = 20;
    this.reps = 10;
    this.sets = 3;
    this.notes = '';
  }

  private svgPlaceholder(label: string): string {
    const safe = this.escapeSvgText(label.slice(0, 20));
    return `data:image/svg+xml;utf8,` +
      `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 600 340'>` +
      `<defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'>` +
      `<stop offset='0%' stop-color='%23d8f3ea'/><stop offset='100%' stop-color='%23e8eff7'/></linearGradient></defs>` +
      `<rect width='600' height='340' fill='url(%23g)'/>` +
      `<text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' fill='%231f4c41' font-size='34' font-family='Segoe UI, sans-serif'>${safe}</text>` +
      `</svg>`;
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

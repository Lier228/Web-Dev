import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';

import { SessionExercise, WeeklyStats, Exercise } from '../core/models/api.models';
import { ApiService } from '../services/api.service';

interface DayMetric {
  label: string;
  dateKey: string;
  points: number;
}

@Component({
  selector: 'app-stats-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <section class="page-stack">
      <div class="page-head">
        <div>
          <h1 class="page-title">Analytics</h1>
          <p class="muted">Global activity and exercise progression.</p>
        </div>
      </div>

      <div class="stats-grid-summary" *ngIf="stats">
        <article class="stat-mini-card">
          <span class="stat-label">TOTAL POINTS</span>
          <span class="stat-value">{{ stats.total_points }}</span>
        </article>
        <article class="stat-mini-card">
          <span class="stat-label">TOTAL SESSIONS</span>
          <span class="stat-value">{{ stats.total_sessions }}</span>
        </article>
      </div>

      <div class="chart-grid" *ngIf="stats">
        <article class="card">
          <h2>Activity Intensity</h2>
          <div class="chart-shell">
            <svg viewBox="0 0 720 240">
              <polyline [attr.points]="linePoints()" fill="none" stroke="#d81c25" stroke-width="4" />
              <circle *ngFor="let day of dayMetrics; let i = index" 
                [attr.cx]="xCoord(i)" 
                [attr.cy]="yCoord(day.points, maxPoints())" 
                r="6" fill="#fff" />
            </svg>
          </div>
        </article>

        <article class="card">
          <h2>Muscle Focus</h2>
          <div class="pie-container">
            <div [style.background]="pieGradient()" class="pie-chart"></div>
            <div class="legend">
              <div class="legend-item" *ngFor="let item of topMuscles(); let i = index">
                <span class="legend-dot" [style.background]="palette(i)"></span>
                <span class="muted">{{ item.muscle }}:</span>
                <strong>{{ item.points }}</strong>
              </div>
            </div>
          </div>
        </article>
      </div>

      <article class="card selector-panel">
        <div class="panel-header">
          <h2>Exercise Explorer</h2>
          <p class="muted">Choose a muscle group and specific exercise</p>
        </div>
        
        <div class="filter-row">
          <button 
            *ngFor="let group of muscleGroups" 
            (click)="selectGroup(group)"
            [class.active]="selectedGroup === group"
            class="chip">
            {{ group }}
          </button>
        </div>

        <div class="exercise-list" *ngIf="filteredExercises.length; else noEx">
          <button 
            *ngFor="let ex of filteredExercises" 
            (click)="selectExercise(ex)"
            [class.selected]="selectedExercise?.id === ex.id"
            class="ex-btn">
            {{ ex.name }}
          </button>
        </div>
        <ng-template #noEx><p class="muted">No exercises found for this group.</p></ng-template>
      </article>

      <article class="card" *ngIf="selectedExercise">
        <div class="chart-header">
          <h2 class="accent-text">{{ selectedExercise.name }}</h2>
          <span class="muted">Max Weight (kg) per day</span>
        </div>
        
        <div class="chart-shell progression-chart">
           <svg viewBox="0 0 720 200">
              <rect *ngFor="let day of dayMetrics; let i = index"
                [attr.x]="xCoord(i) - 15"
                [attr.y]="yCoord(getExerciseMaxWeight(day.dateKey), maxExWeight())"
                width="30"
                [attr.height]="200 - yCoord(getExerciseMaxWeight(day.dateKey), maxExWeight())"
                fill="url(#barGrad)"
                rx="4"
              />
              <defs>
                <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stop-color="#d81c25" />
                  <stop offset="100%" stop-color="#440000" />
                </linearGradient>
              </defs>
              <text *ngFor="let day of dayMetrics; let i = index" [attr.x]="xCoord(i)" y="225" font-size="12" text-anchor="middle" fill="#6f7f90">
                {{ day.label }}
              </text>
           </svg>
        </div>
      </article>
    </section>
  `,
  styles: [`
    .page-stack { display: flex; flex-direction: column; gap: 24px; padding: 20px; color: #fff; }
    .stats-grid-summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; }
    .stat-mini-card { background: #111; padding: 20px; border-radius: 12px; border-left: 4px solid #d81c25; }
    .stat-label { display: block; font-size: 0.8rem; color: #555; font-family: 'Orbitron'; }
    .stat-value { font-size: 1.8rem; font-weight: bold; font-family: 'Orbitron'; }
    p{font-family: 'Saira',sans-serif;}
    
    .chart-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
    .card { background: #0a0a0a; border: 1px solid #1a1a1a; padding: 24px; border-radius: 16px; }
    .pie-container { display: flex; align-items: center; gap: 30px; }
    .pie-chart { width: 140px; height: 140px; border-radius: 50%; flex-shrink: 0; }
    .legend { display: flex; flex-direction: column; gap: 8px; }
    .legend-dot { width: 10px; height: 10px; border-radius: 2px; display: inline-block; margin-right: 8px; }

    .filter-row { display: flex; gap: 10px; overflow-x: auto; padding: 10px 0; }
    .chip { background: #1a1a1a; border: 1px solid #333; color: #888; padding: 8px 18px; border-radius: 20px; cursor: pointer; }
    .chip.active { background: #d81c25; color: #fff; border-color: #d81c25; box-shadow: 0 0 15px rgba(216,28,37,0.3); }

    .exercise-list { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 20px; }
    .ex-btn { background: #111; border: 1px solid #222; color: #ccc; padding: 10px 16px; border-radius: 8px; cursor: pointer; }
    .ex-btn:hover, .ex-btn.selected { border-color: #d81c25; color: #fff; background: #1a0506; }
    
    .progression-chart { height: 260px; margin-top: 20px; }
    .accent-text { color: #d81c25; text-transform: uppercase; letter-spacing: 1px; }
    .chart-shell { width: 100%; height: 200px; }
  `]
})
export class StatsPageComponent implements OnInit {
  private readonly api = inject(ApiService);

  stats: WeeklyStats | null = null;
  dayMetrics: DayMetric[] = [];
  allExercises: Exercise[] = [];
  filteredExercises: Exercise[] = [];
  allEntries: SessionExercise[] = [];
  
  muscleGroups: string[] = ['Chest', 'Back', 'Biceps', 'Triceps', 'Shoulders', 'Legs'];
  selectedGroup: string = 'Chest';
  selectedExercise: Exercise | null = null;

  ngOnInit(): void {
    this.reload();
  }

  reload(): void {
    forkJoin({
      stats: this.api.getWeeklyStats(),
      entries: this.api.getSessionExercises(),
      exercises: this.api.getExercises()
    }).subscribe({
      next: ({ stats, entries, exercises }) => {
        this.stats = stats;
        this.allEntries = entries;
        this.allExercises = exercises;
        this.dayMetrics = this.buildDayMetrics(stats);
        this.selectGroup(this.selectedGroup);
      },
      error: (err) => console.error('Error loading stats:', err)
    });
  }

  selectGroup(group: string) {
    this.selectedGroup = group;
    this.filteredExercises = this.allExercises.filter(ex => {
      const gName = (ex as any).muscle_group_name || (ex as any).muscle_group;
      return gName === group;
    });
    
    if (this.filteredExercises.length > 0) {
      this.selectExercise(this.filteredExercises[0]);
    } else {
      this.selectedExercise = null;
    }
  }

  selectExercise(ex: Exercise) {
    this.selectedExercise = ex;
  }

  getExerciseMaxWeight(date: string): number {
    if (!this.selectedExercise) return 0;
    const dayEntries = this.allEntries.filter(e => 
      e.created_at.startsWith(date) && e.exercise === this.selectedExercise?.id
    );
    return Math.max(...dayEntries.map(e => Number(e.weight_kg) || 0), 0);
  }

  maxExWeight(): number {
    const weights = this.dayMetrics.map(d => this.getExerciseMaxWeight(d.dateKey));
    return Math.max(...weights, 1);
  }

  xCoord = (i: number) => 50 + i * 100;
  yCoord = (v: number, max: number) => 200 - (max === 0 ? 0 : (v / max) * 160);
  maxPoints = () => Math.max(...this.dayMetrics.map(d => d.points), 1);
  
  linePoints() {
    return this.dayMetrics.map((d, i) => `${this.xCoord(i)},${this.yCoord(d.points, this.maxPoints())}`).join(' ');
  }

  palette = (i: number) => ['#d81c25', '#ffb65c', '#7a9df4', '#1f8a70', '#9b7ae4'][i % 5];

  pieGradient() {
    const slices = this.topMuscles();
    if (!slices.length) return 'conic-gradient(#222 0deg 360deg)';
    let cursor = 0;
    const total = slices.reduce((sum, s) => sum + s.points, 0) || 1;
    const stops = slices.map((s, i) => {
      const start = (cursor / total) * 360;
      cursor += s.points;
      return `${this.palette(i)} ${start}deg ${(cursor / total) * 360}deg`;
    });
    return `conic-gradient(${stops.join(', ')})`;
  }

  topMuscles() {
    return [...(this.stats?.muscle_distribution ?? [])]
      .sort((a, b) => b.points - a.points).slice(0, 5);
  }

  private buildDayMetrics(stats: WeeklyStats): DayMetric[] {
    return stats.line_chart.map(point => ({
      label: new Date(point.date).toLocaleDateString('en-US', { weekday: 'short' }),
      dateKey: point.date,
      points: point.points
    }));
  }
}
import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';

import { SessionExercise, WeeklyStats } from '../core/models/api.models';
import { ApiService } from '../services/api.service';

interface DayMetric {
  label: string;
  dateKey: string;
  points: number;
  volume: number;
  averageWeight: number;
  setsReps: number;
}

@Component({
  selector: 'app-stats-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <section class="page-stack">
      <div class="page-head">
        <div>
          <h1 class="page-title">Stats</h1>
          <p class="muted">Your weekly activity and muscle balance.</p>
        </div>
        <label class="field">
          <span class="muted">Period</span>
          <select [(ngModel)]="period" (ngModelChange)="reload()">
            <option value="week">1 week</option>
          </select>
        </label>
      </div>

      <div class="flash error" *ngIf="error">{{ error }}</div>

      <div class="chart-grid" *ngIf="stats">
        <article class="card">
          <div class="page-head">
            <div>
              <h2>Activity points (Mon-Sun)</h2>
              <div class="muted">X: weekday, Y: points</div>
            </div>
            <span class="badge">{{ stats.total_points | number: '1.0-0' }} pts</span>
          </div>

          <div class="chart-shell">
            <svg viewBox="0 0 720 240" preserveAspectRatio="none" aria-label="Weekly points">
              <line x1="40" y1="200" x2="700" y2="200" stroke="#cad6e4" stroke-width="2"></line>
              <line x1="40" y1="30" x2="40" y2="200" stroke="#cad6e4" stroke-width="2"></line>
              <polyline
                [attr.points]="linePoints()"
                fill="none"
                stroke="#1f8a70"
                stroke-width="4"
                stroke-linecap="round"
                stroke-linejoin="round"
              ></polyline>
              <circle
                *ngFor="let day of dayMetrics; let i = index"
                [attr.cx]="xCoord(i)"
                [attr.cy]="yCoord(day.points, maxPoints())"
                r="4.5"
                fill="#176a56"
              ></circle>
              <text *ngFor="let day of dayMetrics; let i = index" [attr.x]="xCoord(i)" y="224" font-size="11" text-anchor="middle" fill="#6f7f90">
                {{ day.label }}
              </text>
            </svg>
          </div>
        </article>

        <article class="card">
          <div class="page-head">
            <div>
              <h2>Muscle Distribution</h2>
              <div class="muted">Share by accumulated points</div>
            </div>
            <span class="badge">{{ stats.total_sessions }} sessions</span>
          </div>

          <div class="toolbar" style="align-items: flex-start;">
            <div
              [style.background]="pieGradient()"
              style="width: 180px; aspect-ratio: 1 / 1; border-radius: 50%; border: 10px solid #f4f7fa; flex-shrink: 0;"
            ></div>

            <div class="legend" style="flex: 1;">
              <div class="legend-item" *ngFor="let item of topMuscles(); let i = index">
                <span class="legend-dot" [style.background]="palette(i)"></span>
                <span>{{ item.muscle }}</span>
                <strong>{{ item.points | number: '1.0-0' }}</strong>
              </div>
            </div>
          </div>
        </article>
      </div>

      <div class="mini-chart-grid" *ngIf="stats">
        <article class="card">
          <h3>Total lifted volume</h3>
          <div class="muted">Weight x reps x sets per day</div>
          <div class="bar-row">
            <div
              class="bar"
              *ngFor="let day of dayMetrics"
              [style.height.%]="height(day.volume, maxVolume())"
              [title]="day.label + ': ' + (day.volume | number: '1.0-0') + ' kg'"
            ></div>
          </div>
        </article>

        <article class="card">
          <h3>Average weight</h3>
          <div class="muted">Average logged weight by day</div>
          <div class="bar-row">
            <div
              class="bar"
              *ngFor="let day of dayMetrics"
              [style.height.%]="height(day.averageWeight, maxAverageWeight())"
              [title]="day.label + ': ' + (day.averageWeight | number: '1.0-1') + ' kg'"
            ></div>
          </div>
        </article>

        <article class="card">
          <h3>Sets x reps load</h3>
          <div class="muted">Total set-rep workload per day</div>
          <div class="bar-row">
            <div
              class="bar"
              *ngFor="let day of dayMetrics"
              [style.height.%]="height(day.setsReps, maxSetsReps())"
              [title]="day.label + ': ' + day.setsReps"
            ></div>
          </div>
        </article>
      </div>
    </section>
  `,
})
export class StatsPageComponent implements OnInit {
  private readonly api = inject(ApiService);

  stats: WeeklyStats | null = null;
  dayMetrics: DayMetric[] = [];
  period = 'week';
  error = '';

  ngOnInit(): void {
    this.reload();
  }

  reload(): void {
    this.error = '';
    forkJoin({
      stats: this.api.getWeeklyStats(),
      entries: this.api.getSessionExercises(),
    }).subscribe({
      next: ({ stats, entries }) => {
        this.stats = stats;
        this.dayMetrics = this.buildDayMetrics(stats, entries);
      },
      error: () => {
        this.error = 'Could not load statistics.';
      },
    });
  }

  xCoord(index: number): number {
    return 50 + index * 108;
  }

  yCoord(value: number, max: number): number {
    const usableHeight = 160;
    const normalized = max === 0 ? 0 : value / max;
    return 200 - normalized * usableHeight;
  }

  linePoints(): string {
    return this.dayMetrics.map((day, index) => `${this.xCoord(index)},${this.yCoord(day.points, this.maxPoints())}`).join(' ');
  }

  palette(index: number): string {
    const colors = ['#1f8a70', '#4cb394', '#ffb65c', '#eb6d66', '#7a9df4', '#9b7ae4', '#58c1dd', '#8fba67'];
    return colors[index % colors.length];
  }

  pieGradient(): string {
    const slices = this.topMuscles();
    if (slices.length === 0) {
      return 'conic-gradient(#d9e4ee 0deg 360deg)';
    }
    const total = slices.reduce((sum, item) => sum + item.points, 0) || 1;
    let cursor = 0;
    const stops = slices.map((slice, index) => {
      const start = (cursor / total) * 360;
      cursor += slice.points;
      const end = (cursor / total) * 360;
      const color = this.palette(index);
      return `${color} ${start}deg ${end}deg`;
    });
    return `conic-gradient(${stops.join(', ')})`;
  }

  topMuscles(): Array<{ muscle: string; points: number }> {
    return [...(this.stats?.muscle_distribution ?? [])]
      .sort((left, right) => right.points - left.points)
      .filter((item) => item.points > 0)
      .slice(0, 7);
  }

  maxPoints(): number {
    return Math.max(...this.dayMetrics.map((day) => day.points), 0);
  }

  maxVolume(): number {
    return Math.max(...this.dayMetrics.map((day) => day.volume), 0);
  }

  maxAverageWeight(): number {
    return Math.max(...this.dayMetrics.map((day) => day.averageWeight), 0);
  }

  maxSetsReps(): number {
    return Math.max(...this.dayMetrics.map((day) => day.setsReps), 0);
  }

  height(value: number, max: number): number {
    if (max === 0) {
      return 6;
    }
    return Math.max(6, (value / max) * 100);
  }

  private buildDayMetrics(stats: WeeklyStats, entries: SessionExercise[]): DayMetric[] {
    const bucket = new Map<string, { volume: number; weightSum: number; weightCount: number; setsReps: number }>();

    for (const item of entries) {
      const key = item.created_at.slice(0, 10);
      const weight = Number(item.weight_kg);
      const reps = Number(item.reps);
      const sets = Number(item.sets);
      const current = bucket.get(key) ?? { volume: 0, weightSum: 0, weightCount: 0, setsReps: 0 };
      current.volume += weight * reps * sets;
      current.weightSum += weight;
      current.weightCount += 1;
      current.setsReps += sets * reps;
      bucket.set(key, current);
    }

    return stats.line_chart.map((point) => {
      const values = bucket.get(point.date) ?? { volume: 0, weightSum: 0, weightCount: 0, setsReps: 0 };
      return {
        label: this.weekday(point.date),
        dateKey: point.date,
        points: point.points,
        volume: values.volume,
        averageWeight: values.weightCount ? values.weightSum / values.weightCount : 0,
        setsReps: values.setsReps,
      };
    });
  }

  private weekday(isoDate: string): string {
    const date = new Date(isoDate);
    return date.toLocaleDateString(undefined, { weekday: 'short' });
  }
}

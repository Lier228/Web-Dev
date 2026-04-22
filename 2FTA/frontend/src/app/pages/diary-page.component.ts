import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { SessionExercise, Exercise } from '../core/models/api.models';
import { ApiService } from '../services/api.service';

interface TrainingSession {
  date: string;
  displayDate: string;
  duration: string;
  exercises: SessionExercise[];
  isOpen?: boolean; // Для аккордеона
}

@Component({
  selector: 'app-diary-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <section class="page-stack">
      <div class="page-head">
        <div>
          <h1 class="page-title">Training Diary</h1>
          <p class="muted">History of your strength and progress.</p>
        </div>
        
        <div class="period-selector">
          <button (click)="setPeriod('week')" [class.active]="period === 'week'">Week</button>
          <button (click)="setPeriod('month')" [class.active]="period === 'month'">Month</button>
        </div>
      </div>

      <div class="sessions-list">
        <div *ngFor="let session of filteredSessions" class="session-card" [class.open]="session.isOpen">
          <div class="session-header" (click)="session.isOpen = !session.isOpen">
            <div class="session-info">
              <span class="session-date">{{ session.displayDate }}</span>
              <div class="session-meta">
                <span class="tag">⏱ {{ session.duration }} min</span>
              </div>
            </div>
            <div class="chevron"></div>
          </div>

          <div class="session-details" *ngIf="session.isOpen">
            <div *ngFor="let ex of session.exercises" class="exercise-row">
              <div class="ex-name">
                {{ getExerciseName(ex.exercise) }}
              </div>
              <div class="ex-stats">
                <span>{{ ex.sets }} sets</span>
                <span>×</span>
                <span>{{ ex.reps }} reps</span>
                <span class="weight">{{ ex.weight_kg }} kg</span>
              </div>
            </div>
          </div>
        </div>

        <div *ngIf="filteredSessions.length === 0" class="empty-state">
          <p class="muted">No training sessions found for this period.</p>
        </div>
      </div>
    </section>
  `,
  styles: [`
  
  p{font-family: 'Saira',sans-serif;}
    .page-stack { padding: 20px; display: flex; flex-direction: column; gap: 20px; }
    .page-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
    
    

    .period-selector { background: #111; padding: 4px; border-radius: 12px; display: flex; gap: 4px; }
    .period-selector button { 
      background: transparent; border: none; color: #555; padding: 8px 16px; 
      border-radius: 8px; cursor: pointer; font-family: 'Orbitron', sans-serif; font-size: 0.8rem;
    }
    .period-selector button.active { background: #d81c25; color: #fff; }


    .sessions-list { display: flex; flex-direction: column; gap: 12px; }
    .session-card { 
      background: #0a0a0a; border: 1px solid #1a1a1a; border-radius: 16px; 
      overflow: hidden; transition: 0.3s; 
    }
    .session-card.open { border-color: #d81c25; }

    .session-header { 
      padding: 20px; cursor: pointer; display: flex; justify-content: space-between; align-items: center; 
    }
    .session-date { font-family: 'Orbitron'; font-size: 1.1rem; display: block; margin-bottom: 6px; }
    .session-meta { display: flex; gap: 10px; }
    .tag { font-size: 0.75rem; color: #888; background: #1a1a1a; padding: 4px 10px; border-radius: 6px; }

   
    .session-details { background: #050505; padding: 10px 20px 20px; border-top: 1px solid #111; }
    .exercise-row { 
      display: flex; justify-content: space-between; align-items: center; 
      padding: 12px 0; border-bottom: 1px solid #111;
    }
    .exercise-row:last-child { border-bottom: none; }
    .ex-name { font-weight: bold; color: #eee; }
    .ex-stats { display: flex; gap: 12px; color: #666; font-size: 0.9rem; }
    .weight { color: #d81c25; font-weight: bold; }

    .chevron { 
      width: 10px; height: 10px; border-right: 2px solid #333; border-bottom: 2px solid #333; 
      transform: rotate(45deg); transition: 0.3s;
    }
    .open .chevron { transform: rotate(-135deg); border-color: #d81c25; }
  `]
})
export class DiaryPageComponent implements OnInit {
  private readonly api = inject(ApiService);

  allExercises: Exercise[] = [];
  allSessions: TrainingSession[] = [];
  filteredSessions: TrainingSession[] = [];
  period: 'week' | 'month' = 'week';

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    forkJoin({
      entries: this.api.getSessionExercises(),
      exercises: this.api.getExercises()
    }).subscribe(({ entries, exercises }) => {
      this.allExercises = exercises;
      this.allSessions = this.groupEntriesIntoSessions(entries);
      this.setPeriod(this.period);
    });
  }

  setPeriod(p: 'week' | 'month') {
    this.period = p;
    const now = new Date();
    const days = p === 'week' ? 7 : 30;
    const cutoff = new Date(now.setDate(now.getDate() - days));

    this.filteredSessions = this.allSessions.filter(s => new Date(s.date) >= cutoff);
  }

  private groupEntriesIntoSessions(entries: SessionExercise[]): TrainingSession[] {
    const groups = new Map<string, SessionExercise[]>();

    entries.forEach(e => {
      const date = e.created_at.slice(0, 10);
      if (!groups.has(date)) groups.set(date, []);
      groups.get(date)!.push(e);
    });

    return Array.from(groups.entries()).map(([date, exList]) => {
      
      return {
        date,
        displayDate: new Date(date).toLocaleDateString('en-US', { day: 'numeric', month: 'short', weekday: 'long' }),
        duration: (exList.length * 12).toString(), 
        exercises: exList,
        isOpen: false
      };
    }).sort((a, b) => b.date.localeCompare(a.date)); 
  }

  getExerciseName(id: number | string): string {
    return this.allExercises.find(ex => ex.id === id)?.name || 'Unknown Exercise';
  }
}
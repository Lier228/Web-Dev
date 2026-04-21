import { Routes } from '@angular/router';

import { authGuard } from './core/guards/auth.guard';
import { ExercisesPageComponent } from './pages/exercises-page.component';
import { LoginPageComponent } from './pages/login-page.component';
import { SessionPageComponent } from './pages/session-page.component';
import { StatsPageComponent } from './pages/stats-page.component';

export const routes: Routes = [
  { path: 'login', component: LoginPageComponent },
  { path: 'exercises', component: ExercisesPageComponent, canActivate: [authGuard] },
  { path: 'session', component: SessionPageComponent, canActivate: [authGuard] },
  { path: 'stats', component: StatsPageComponent, canActivate: [authGuard] },
  { path: '', pathMatch: 'full', redirectTo: 'login' },
  { path: '**', redirectTo: 'login' },
];

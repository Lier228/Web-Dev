import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { ApiService } from '../services/api.service';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <section class="card login-card">
      <div class="page-head">
        <div>
          <h1 class="page-title">Fitness Tracker</h1>
          <p class="muted">Login or create an account to start tracking workouts.</p>
        </div>
      </div>

      <form class="stack" (ngSubmit)="login()">
        <label class="field">
          <span class="muted">Username</span>
          <input name="username" [(ngModel)]="username" required />
        </label>

        <label class="field">
          <span class="muted">Password</span>
          <input name="password" type="password" [(ngModel)]="password" required minlength="4" />
        </label>

        <div class="toolbar">
          <button class="btn" type="submit" [disabled]="loading">{{ loading ? 'Loading...' : 'Login' }}</button>
          <button class="btn secondary" type="button" [disabled]="loading" (click)="register()">Create account</button>
        </div>

        <p class="muted" *ngIf="message">{{ message }}</p>
        <p class="muted" *ngIf="error">{{ error }}</p>
      </form>
    </section>
  `,
  styles: [
    `
      .login-card {
        width: min(460px, 100%);
      }
    `,
  ],
})
export class LoginPageComponent {
  private readonly api = inject(ApiService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  username = '';
  password = '';
  loading = false;
  error = '';
  message = '';

  login(): void {
    this.loading = true;
    this.error = '';
    this.message = '';
    this.api.login({ username: this.username, password: this.password }).subscribe({
      next: (response) => {
        this.authService.storeSession(response);
        this.router.navigateByUrl('/exercises');
      },
      error: () => {
        this.error = 'Login failed. Check credentials.';
        this.loading = false;
      },
      complete: () => {
        this.loading = false;
      },
    });
  }

  register(): void {
    this.loading = true;
    this.error = '';
    this.message = '';
    this.api.register({ username: this.username, password: this.password }).subscribe({
      next: () => {
        this.message = 'Account created. Now log in.';
      },
      error: () => {
        this.error = 'Registration failed. Username may already exist.';
      },
      complete: () => {
        this.loading = false;
      },
    });
  }
}

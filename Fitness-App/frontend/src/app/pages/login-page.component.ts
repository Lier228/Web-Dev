import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';

import { ApiService } from '../services/api.service';
import { AuthService } from '../services/auth.service';

type AuthModalMode = 'login' | 'register';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <section class="auth-reference">
      <div class="auth-reference__hero">
        <div class="auth-reference__brand">2FTA</div>
        <div class="auth-reference__copy">
          <h1>USEFULL SITE FOR YOUR FITNESS PROGRESS</h1>
        </div>

        <div class="auth-reference__actions">
          <button class="auth-reference__primary" type="button" (click)="openModal('register')">SIGN UP</button>

          <div class="auth-reference__signin-copy">
            <span>Already have an account?</span>
            <button class="auth-reference__link" type="button" (click)="openModal('login')">Sign in</button>
          </div>
        </div>
      </div>

      <div class="auth-reference__image"></div>

      <div class="auth-reference__backdrop" *ngIf="isModalOpen" (click)="closeModal()">
        <section class="auth-reference__modal" (click)="$event.stopPropagation()">
          <button class="auth-reference__close" type="button" (click)="closeModal()">x</button>

          <div class="auth-reference__modal-title">
            <span>{{ modalMode === 'register' ? 'SIGN UP FOR' : 'SIGN IN TO' }}</span>
            <strong>2FTA</strong>
          </div>

          <form class="auth-reference__modal-form" (ngSubmit)="submit()">
            <label class="auth-reference__field">
              <span>Username</span>
              <input name="username" [(ngModel)]="username" required />
            </label>

            <label class="auth-reference__field">
              <span>Password</span>
              <input name="password" type="password" [(ngModel)]="password" required minlength="4" />
            </label>

            <div class="auth-reference__modal-actions">
              <button class="auth-reference__submit auth-reference__submit--red" type="submit" [disabled]="loading">
                {{
                  loading
                    ? (modalMode === 'register' ? 'Creating...' : 'Loading...')
                    : (modalMode === 'register' ? 'Create account' : 'Login')
                }}
              </button>
            </div>

            <p class="auth-reference__status auth-reference__status--success" *ngIf="message">{{ message }}</p>
            <p class="auth-reference__status auth-reference__status--error" *ngIf="error">{{ error }}</p>

            <button class="auth-reference__switch" type="button" (click)="toggleMode()" [disabled]="loading">
              {{
                modalMode === 'register'
                  ? 'Already have an account? Sign in'
                  : 'No account yet? Create one'
              }}
            </button>
          </form>
        </section>
      </div>
    </section>
  `,
  styles: [
    `
      :host {
        width: 100%;
      }

      .auth-reference {
        position: relative;
        width: min(1400px, 100%);
        min-height: 860px;
        display: grid;
        grid-template-columns: minmax(360px, 56%) 1fr;
        overflow: hidden;
        background: #080808;
        box-shadow: 0 28px 80px rgba(0, 0, 0, 0.42);
      }

      .auth-reference__hero {
        position: relative;
        z-index: 1;
        padding: 64px 54px 72px 56px;
        display: flex;
        flex-direction: column;
        gap: 44px;
        background: linear-gradient(180deg, #d91d26 0%, #c41720 60%, #b11018 100%);
        color: #ffffff;
        clip-path: polygon(0 0, 88% 0, 100% 100%, 0 100%);
      }

      .auth-reference__brand {
        font-size: clamp(4rem, 10vw, 7.4rem);
        font-weight: 500;
        letter-spacing: 0.08em;
        line-height: 0.9;
        font-family: Orbitron, 'Segoe UI', sans-serif;
      }

      .auth-reference__copy {
        display: grid;
        max-width: 430px;
      }

      .auth-reference__copy h1 {
        margin: 0;
        font-size: clamp(2rem, 4vw, 3rem);
        line-height: 1.32;
        letter-spacing: 0.08em;
        font-weight: 500;
        text-transform: uppercase;
        font-family: Orbitron, 'Segoe UI', sans-serif;
      }

      .auth-reference__actions {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        gap: 28px;
      }

      .auth-reference__primary,
      .auth-reference__submit {
        border: none;
        font-weight: 700;
        cursor: pointer;
      }

      .auth-reference__primary {
        min-width: 360px;
        height: 74px;
        padding: 0 36px;
        border-radius: 18px;
        background: #9f9a9a;
        color: #ececec;
        font-size: 1.7rem;
        letter-spacing: 0.08em;
        font-family: Orbitron, 'Segoe UI', sans-serif;
      }

      .auth-reference__signin-copy {
        display: grid;
        gap: 6px;
        font-size: 1rem;
      }

      .auth-reference__link,
      .auth-reference__switch {
        border: none;
        background: transparent;
        cursor: pointer;
        padding: 0;
        text-decoration: underline;
        text-underline-offset: 2px;
        font-size: 0.95rem;
      }

      .auth-reference__link {
        color: #ffffff;
      }

      .auth-reference__image {
        position: relative;
        min-height: 860px;
        background:
          linear-gradient(180deg, rgba(0, 0, 0, 0.08), rgba(0, 0, 0, 0.48)),
          url('https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=1200&q=80');
        background-size: cover;
        background-position: center right;
        filter: grayscale(1);
        transform: scale(1.02);
      }

      .auth-reference__backdrop {
        position: absolute;
        inset: 0;
        z-index: 3;
        display: grid;
        place-items: center;
        padding: 24px;
        background: rgba(0, 0, 0, 0.34);
      }

      .auth-reference__modal {
        position: relative;
        width: min(700px, calc(100% - 32px));
        border-radius: 22px;
        background: #adabab;
        padding: 34px 40px 28px;
        box-shadow: 0 26px 60px rgba(0, 0, 0, 0.28);
        display: grid;
        gap: 26px;
      }

      .auth-reference__close {
        position: absolute;
        top: 14px;
        right: 18px;
        width: 34px;
        height: 34px;
        border: none;
        border-radius: 50%;
        background: transparent;
        color: #171717;
        font-size: 1.5rem;
        cursor: pointer;
      }

      .auth-reference__modal-title {
        display: flex;
        align-items: center;
        gap: 10px;
        flex-wrap: wrap;
        font-weight: 500;
        letter-spacing: 0.08em;
        color: #f5f5f5;
        font-size: clamp(1.8rem, 4vw, 3rem);
        font-family: Orbitron, 'Segoe UI', sans-serif;
      }

      .auth-reference__modal-title strong {
        padding: 8px 18px;
        border-radius: 12px;
        background: #d51d26;
        color: #121212;
      }

      .auth-reference__modal-form {
        display: grid;
        gap: 24px;
        max-width: 520px;
      }

      .auth-reference__field {
        display: grid;
        gap: 6px;
      }

      .auth-reference__field span {
        font-size: 1.1rem;
        font-weight: 700;
        color: #111111;
      }

      .auth-reference__field input {
        height: 48px;
        border-radius: 14px;
        border: 3px solid #5c5c5c;
        padding: 0 16px;
        background: #d8d8d8;
        color: #111111;
        font-size: 1rem;
      }

      .auth-reference__modal-actions {
        display: flex;
        justify-content: flex-end;
      }

      .auth-reference__submit {
        width: fit-content;
        min-width: 280px;
        min-height: 82px;
        padding: 0 20px;
        border-radius: 14px;
        border: 3px solid #641014;
        background: #d11b24;
        color: #111111;
        font-size: 1.15rem;
        box-shadow: none;
      }

      .auth-reference__submit:disabled {
        opacity: 0.7;
        cursor: not-allowed;
      }

      .auth-reference__status {
        margin: 0;
        font-size: 0.9rem;
        font-weight: 600;
      }

      .auth-reference__status--error {
        color: #7f1117;
      }

      .auth-reference__status--success {
        color: #154f2b;
      }

      .auth-reference__switch {
        width: fit-content;
        color: #1d1d1d;
      }

      @media (max-width: 880px) {
        .auth-reference {
          grid-template-columns: 1fr;
          min-height: auto;
        }

        .auth-reference__image {
          min-height: 320px;
          order: -1;
          transform: none;
        }

        .auth-reference__hero {
          clip-path: none;
          padding: 40px 24px 48px;
        }

        .auth-reference__primary {
          min-width: 100%;
        }

        .auth-reference__modal {
          padding: 24px 20px;
        }

        .auth-reference__submit {
          min-width: 100%;
        }
      }

      @media (max-width: 640px) {
        .auth-reference__brand {
          font-size: 3.4rem;
        }

        .auth-reference__copy h1 {
          font-size: 1.7rem;
        }

        .auth-reference__backdrop {
          padding: 14px;
        }
      }
    `,
  ],
})
export class LoginPageComponent {
  private readonly api = inject(ApiService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  isModalOpen = false;
  modalMode: AuthModalMode = 'login';
  username = '';
  password = '';
  loading = false;
  error = '';
  message = '';

  openModal(mode: AuthModalMode): void {
    this.modalMode = mode;
    this.isModalOpen = true;
    this.clearStatus();
  }

  closeModal(): void {
    this.isModalOpen = false;
    this.loading = false;
    this.clearStatus();
  }

  toggleMode(): void {
    this.modalMode = this.modalMode === 'login' ? 'register' : 'login';
    this.clearStatus();
  }

  submit(): void {
    if (this.modalMode === 'login') {
      this.login();
      return;
    }

    this.register();
  }

  private login(): void {
    this.loading = true;
    this.error = '';
    this.message = '';
    this.api
      .login({ username: this.username, password: this.password })
      .pipe(
        finalize(() => {
          this.loading = false;
        }),
      )
      .subscribe({
        next: (response) => {
          this.authService.storeSession(response);
          this.isModalOpen = false;
          this.router.navigateByUrl('/exercises');
        },
        error: (error: HttpErrorResponse) => {
          this.error = this.extractErrorMessage(error, 'Login failed. Check credentials.');
        },
      });
  }

  private register(): void {
    this.loading = true;
    this.error = '';
    this.message = '';
    this.api
      .register({
        username: this.username,
        password: this.password,
      })
      .pipe(
        finalize(() => {
          this.loading = false;
        }),
      )
      .subscribe({
        next: () => {
          this.message = 'Account created. Now sign in.';
          this.modalMode = 'login';
          this.password = '';
          this.isModalOpen = true;
        },
        error: (error: HttpErrorResponse) => {
          this.error = this.extractErrorMessage(error, 'Registration failed.');
        },
      });
  }

  private clearStatus(): void {
    this.error = '';
    this.message = '';
  }

  private extractErrorMessage(error: HttpErrorResponse, fallback: string): string {
    const payload = error.error;
    if (!payload) {
      return fallback;
    }

    if (typeof payload === 'string') {
      return payload;
    }

    if (typeof payload.detail === 'string') {
      return payload.detail;
    }

    if (typeof payload.non_field_errors?.[0] === 'string') {
      return payload.non_field_errors[0];
    }

    for (const value of Object.values(payload as Record<string, unknown>)) {
      if (typeof value === 'string') {
        return value;
      }
      if (Array.isArray(value) && typeof value[0] === 'string') {
        return value[0];
      }
    }

    return fallback;
  }
}

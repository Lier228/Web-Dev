import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, inject } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { finalize, filter } from 'rxjs';

import { ApiService } from './services/api.service';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <ng-container *ngIf="isAuthRoute() || !authService.isLoggedIn(); else appShell">
      <main class="auth-shell">
        <router-outlet></router-outlet>
      </main>
    </ng-container>

    <ng-template #appShell>
      <div class="app-shell" *ngIf="authService.isLoggedIn()">
        <aside class="sidebar">
          <nav class="side-nav">
            <a routerLink="/exercises" routerLinkActive="active">Exercise</a>
            <a routerLink="/session" routerLinkActive="active">Session</a>
            <a routerLink="/stats" routerLinkActive="active">Statistics</a>
            <a routerLink="/diary" routerLinkActive="active">Diary</a>
          </nav>

          <button class="btn ghost" type="button" (click)="logout()">Logout</button>
        </aside>

        <section class="main-panel">
          <header class="profile-bar">
            <div class="profile-card">
              <div class="avatar" *ngIf="!userAvatar(); else avatarImage">{{ userInitials() }}</div>
              <ng-template #avatarImage>
                <img class="avatar avatar--image" [src]="userAvatar()" [alt]="authService.getUsername()" />
              </ng-template>
              <div class="profile-copy">
                <div class="muted">Signed in</div>
                <div class="profile-name">{{ authService.getUsername() }}</div>
              </div>
              <div class="profile-actions">
                <input #avatarInput class="profile-file-input" type="file" accept="image/*" (change)="onAvatarSelected($event)" />
                <button class="btn secondary profile-action" type="button" (click)="avatarInput.click()" [disabled]="avatarUploading">
                  {{ avatarUploading ? 'Uploading...' : 'Change avatar' }}
                </button>
              </div>
            </div>
            <div class="profile-status" *ngIf="profileMessage || profileError">
              <span class="muted" *ngIf="profileMessage && !profileError">{{ profileMessage }}</span>
              <span class="profile-error" *ngIf="profileError">{{ profileError }}</span>
            </div>
          </header>

          <main class="content-area">
            <router-outlet></router-outlet>
          </main>
        </section>
      </div>
    </ng-template>
  `,
})
export class AppComponent implements OnInit {
  protected readonly authService = inject(AuthService);
  private readonly api = inject(ApiService);
  private readonly router = inject(Router);
  private currentUrl = this.router.url;
  avatarUploading = false;
  profileMessage = '';
  profileError = '';

  constructor() {
    this.authService.authState$.subscribe((isLoggedIn) => {
      if (isLoggedIn) {
        this.loadProfile();
      }
    });

    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event) => {
        this.currentUrl = (event as NavigationEnd).urlAfterRedirects;
      });
  }

  ngOnInit(): void {
    this.loadProfile();
  }

  isAuthRoute(): boolean {
    return this.currentUrl.startsWith('/login');
  }

  userInitials(): string {
    const username = this.authService.getUsername().trim();
    if (!username) {
      return 'U';
    }
    return username
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? '')
      .join('');
  }

  userAvatar(): string | null {
    return this.authService.getAvatar();
  }

  logout(): void {
    const refresh = this.authService.getRefreshToken();
    if (!refresh) {
      this.authService.clearSession();
      this.router.navigateByUrl('/login');
      return;
    }

    this.api.logout(refresh).subscribe({
      next: () => {
        this.authService.clearSession();
        this.router.navigateByUrl('/login');
      },
      error: () => {
        this.authService.clearSession();
        this.router.navigateByUrl('/login');
      },
    });
  }

  onAvatarSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) {
      return;
    }

    if (!file.type.startsWith('image/')) {
      this.profileMessage = '';
      this.profileError = 'Choose an image file.';
      input.value = '';
      return;
    }

    const formData = new FormData();
    formData.append('avatar', file);

    this.avatarUploading = true;
    this.profileMessage = '';
    this.profileError = '';

    this.api.updateProfile(formData)
      .pipe(finalize(() => {
        this.avatarUploading = false;
        input.value = '';
      }))
      .subscribe({
        next: (user) => {
          this.authService.setUser(user);
          this.profileMessage = 'Avatar updated.';
          this.profileError = '';
        },
        error: (error: HttpErrorResponse) => {
          this.profileMessage = '';
          this.profileError = this.extractProfileError(error);
        },
      });
  }

  private loadProfile(): void {
    if (!this.authService.isLoggedIn()) {
      return;
    }

    this.api.getProfile().subscribe({
      next: (user) => {
        this.authService.setUser(user);
      },
      error: () => {
        // 401 handling is centralized in the auth interceptor.
      },
    });
  }

  private extractProfileError(error: HttpErrorResponse): string {
    const payload = error.error as Record<string, unknown> | string | null;
    if (!payload) {
      return 'Failed to update avatar.';
    }

    if (typeof payload === 'string') {
      return payload;
    }

    if (typeof payload['detail'] === 'string') {
      return payload['detail'];
    }

    const avatarErrors = payload['avatar'];
    if (Array.isArray(avatarErrors) && typeof avatarErrors[0] === 'string') {
      return avatarErrors[0];
    }

    return 'Failed to update avatar.';
  }
}

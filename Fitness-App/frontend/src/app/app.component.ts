import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';

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
          </nav>

          <button class="btn ghost" type="button" (click)="logout()">Logout</button>
        </aside>

        <section class="main-panel">
          <header class="profile-bar">
            <div class="profile-card">
              <div class="avatar">{{ userInitials() }}</div>
              <div>
                <div class="muted">Signed in</div>
                <div class="profile-name">{{ authService.getUsername() }}</div>
              </div>
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
export class AppComponent {
  protected readonly authService = inject(AuthService);
  private readonly api = inject(ApiService);
  private readonly router = inject(Router);
  private currentUrl = this.router.url;

  constructor() {
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event) => {
        this.currentUrl = (event as NavigationEnd).urlAfterRedirects;
      });
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
}

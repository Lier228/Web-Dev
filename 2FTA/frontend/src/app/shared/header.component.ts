import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';

import { ApiService } from '../services/api.service';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <header class="header" *ngIf="authService.isLoggedIn()">
      <div class="header-inner">
        <a routerLink="/exercises" class="brand">Fitness App</a>
        <nav class="nav">
          <a routerLink="/exercises" routerLinkActive="active">Exercises</a>
          <a routerLink="/session" routerLinkActive="active">Session</a>
          <a routerLink="/stats" routerLinkActive="active">Stats</a>
        </nav>
        <button class="btn secondary" type="button" (click)="logout()">Logout</button>
      </div>
    </header>
  `,
  styles: [
    `
      .header {
        position: sticky;
        top: 0;
        z-index: 10;
        background: #111827;
        color: #ffffff;
      }

      .header-inner {
        width: min(1120px, calc(100% - 32px));
        margin: 0 auto;
        padding: 16px 0;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 16px;
      }

      .brand,
      .nav a {
        color: inherit;
        text-decoration: none;
      }

      .brand {
        font-weight: 700;
      }

      .nav {
        display: flex;
        gap: 16px;
        flex: 1;
      }

      .active {
        text-decoration: underline;
      }
    `,
  ],
})
export class HeaderComponent {
  protected readonly authService = inject(AuthService);
  private readonly api = inject(ApiService);
  private readonly router = inject(Router);

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

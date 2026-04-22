import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import { LoginResponse, User } from '../core/models/api.models';

const ACCESS_TOKEN_KEY = 'fitness.access';
const REFRESH_TOKEN_KEY = 'fitness.refresh';
const USER_KEY = 'fitness.user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly authState = new BehaviorSubject<boolean>(this.hasValidAccessToken());
  readonly authState$ = this.authState.asObservable();

  constructor() {
    if (!this.hasValidAccessToken()) {
      this.clearStorage();
    }
  }

  storeSession(payload: LoginResponse): void {
    localStorage.setItem(ACCESS_TOKEN_KEY, payload.access);
    localStorage.setItem(REFRESH_TOKEN_KEY, payload.refresh);
    this.setUser(payload.user);
    this.authState.next(this.hasValidAccessToken());
  }

  clearSession(): void {
    this.clearStorage();
    this.authState.next(false);
  }

  getAccessToken(): string | null {
    if (!this.hasValidAccessToken()) {
      this.clearSession();
      return null;
    }

    return localStorage.getItem(ACCESS_TOKEN_KEY);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  }

  getUser(): User | null {
    const rawUser = localStorage.getItem(USER_KEY);
    if (!rawUser) {
      return null;
    }

    try {
      return JSON.parse(rawUser) as User;
    } catch {
      return null;
    }
  }

  getUsername(): string {
    return this.getUser()?.username ?? 'Athlete';
  }

  getAvatar(): string | null {
    return this.getUser()?.avatar ?? null;
  }

  setUser(user: User): void {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }

  isLoggedIn(): boolean {
    return this.hasValidAccessToken();
  }

  private hasValidAccessToken(): boolean {
    const token = localStorage.getItem(ACCESS_TOKEN_KEY);
    if (!token) {
      return false;
    }

    const payload = this.parseJwtPayload(token);
    if (!payload || typeof payload.exp !== 'number') {
      return false;
    }

    return payload.exp * 1000 > Date.now();
  }

  private parseJwtPayload(token: string): { exp?: number } | null {
    const parts = token.split('.');
    if (parts.length !== 3) {
      return null;
    }

    try {
      const normalized = parts[1].replace(/-/g, '+').replace(/_/g, '/');
      const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=');
      const decoded = atob(padded);
      return JSON.parse(decoded) as { exp?: number };
    } catch {
      return null;
    }
  }

  private clearStorage(): void {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }
}

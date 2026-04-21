import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import { LoginResponse, User } from '../core/models/api.models';

const ACCESS_TOKEN_KEY = 'fitness.access';
const REFRESH_TOKEN_KEY = 'fitness.refresh';
const USER_KEY = 'fitness.user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly authState = new BehaviorSubject<boolean>(this.hasAccessToken());
  readonly authState$ = this.authState.asObservable();

  storeSession(payload: LoginResponse): void {
    localStorage.setItem(ACCESS_TOKEN_KEY, payload.access);
    localStorage.setItem(REFRESH_TOKEN_KEY, payload.refresh);
    localStorage.setItem(USER_KEY, JSON.stringify(payload.user));
    this.authState.next(true);
  }

  clearSession(): void {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    this.authState.next(false);
  }

  getAccessToken(): string | null {
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

  isLoggedIn(): boolean {
    return this.authState.value;
  }

  private hasAccessToken(): boolean {
    return Boolean(localStorage.getItem(ACCESS_TOKEN_KEY));
  }
}

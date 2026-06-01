import { Injectable, inject, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { Api } from './api';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

interface UserSession {
  _id: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'cashier';
  token: string;
}

@Injectable({
  providedIn: 'root',
})
export class Auth {
  private readonly api = inject(Api);
  private readonly router = inject(Router);

  // Core reactive state
  readonly currentUser = signal<UserSession | null>(null);
  readonly isLoggedIn = computed(() => this.currentUser() !== null);
  readonly userRole = computed(() => this.currentUser()?.role || null);

  private logoutTimer: any;

  constructor() {
    this.loadSession();
  }

  login(credentials: { email: string; password: string }): Observable<UserSession> {
    return this.api.post<UserSession>('/users/login', credentials).pipe(
      tap((session) => {
        this.saveSession(session);
      })
    );
  }

  logout(): void {
    this.clearSession();
    this.router.navigate(['/login']);
  }

  hasRole(allowedRoles: string[]): boolean {
    const role = this.userRole();
    if (!role) return false;
    return allowedRoles.includes(role);
  }

  private saveSession(session: UserSession): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('mart_session', JSON.stringify(session));
    }
    this.currentUser.set(session);
    this.scheduleAutoLogout(session.token);
  }

  private loadSession(): void {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('mart_session');
      if (stored) {
        try {
          const session: UserSession = JSON.parse(stored);
          if (this.isTokenExpired(session.token)) {
            this.clearSession();
          } else {
            this.currentUser.set(session);
            this.scheduleAutoLogout(session.token);
          }
        } catch (e) {
          this.clearSession();
        }
      }
    }
  }

  private clearSession(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('mart_session');
    }
    this.currentUser.set(null);
    if (this.logoutTimer) {
      clearTimeout(this.logoutTimer);
    }
  }

  private isTokenExpired(token: string): boolean {
    const expiry = this.getTokenExpirationDate(token);
    if (!expiry) return true;
    return expiry.getTime() < Date.now();
  }

  private getTokenExpirationDate(token: string): Date | null {
    try {
      const decoded = this.decodeToken(token);
      if (!decoded || !decoded.exp) return null;
      const date = new Date(0);
      date.setUTCSeconds(decoded.exp);
      return date;
    } catch (e) {
      return null;
    }
  }

  private decodeToken(token: string): any {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return null;
      const payload = parts[1];
      const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
      return JSON.parse(decoded);
    } catch (e) {
      return null;
    }
  }

  private scheduleAutoLogout(token: string): void {
    if (this.logoutTimer) {
      clearTimeout(this.logoutTimer);
    }
    const expiry = this.getTokenExpirationDate(token);
    if (!expiry) return;

    const timeout = expiry.getTime() - Date.now();
    if (timeout <= 0) {
      this.logout();
    } else {
      this.logoutTimer = setTimeout(() => {
        this.logout();
        alert('Your session has expired. Please log in again.');
      }, timeout);
    }
  }
}

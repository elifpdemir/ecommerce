import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, BehaviorSubject, tap, map } from 'rxjs';

export type UserRole = 'ADMIN' | 'CORPORATE' | 'INDIVIDUAL';

export interface AuthResponse {
  token: string;
  email: string;
  roleType: UserRole;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly API = 'http://localhost:8081/api/auth';
  private readonly TOKEN_KEY = 'token';
  private currentUserSubject = new BehaviorSubject<any>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) {
    // Auto-login disabled to allow guest browsing as requested by user
    // To restore auto-login, uncomment below:
    /*
    const token = this.getToken();
    if (token && !this.isTokenExpired(token)) {
      this.currentUserSubject.next(this.decodeToken(token));
    }
    */
  }

  login(credentials: { email: string, password: string }): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API}/login`, credentials).pipe(
      tap(res => {
        localStorage.setItem(this.TOKEN_KEY, res.token);
        this.currentUserSubject.next(this.decodeToken(res.token));
      })
    );
  }

  logout() {
    localStorage.removeItem(this.TOKEN_KEY);
    this.currentUserSubject.next(null);
    window.location.href = '/home';
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  isLoggedIn(): boolean {
    const token = this.getToken();
    return !!token && !this.isTokenExpired(token);
  }

  getRole(): UserRole | null {
    const token = this.getToken();
    if (!token) return null;
    const payload = this.decodeToken(token);
    return payload ? payload.role as UserRole : null;
  }

  getUserEmail(): string | null {
    const token = this.getToken();
    if (!token) return null;
    const payload = this.decodeToken(token);
    return payload ? payload.sub : null;
  }

  private decodeToken(token: string): any {
    try {
      return JSON.parse(atob(token.split('.')[1]));
    } catch {
      return null;
    }
  }

  private isTokenExpired(token: string): boolean {
    const payload = this.decodeToken(token);
    if (!payload || !payload.exp) return true;
    return payload.exp * 1000 < Date.now();
  }
}

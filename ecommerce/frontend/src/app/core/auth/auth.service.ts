import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';

import { of } from 'rxjs';

// export type... is below
export type UserRole = 'ADMIN' | 'SELLER' | 'CUSTOMER';

export interface AuthResponse {
  token: string;
  role: UserRole;
  username: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly API = 'http://localhost:8080/api/auth';
  private readonly TOKEN_KEY = 'jwt_token';

  constructor(private http: HttpClient, private router: Router) {}

  login(username: string, password: string) {
    // TEMPORARY: Returning a mock JWT since the backend is not yet available
    const mockRole: UserRole = username.toLowerCase() === 'seller' ? 'SELLER' : (username.toLowerCase() === 'admin' ? 'ADMIN' : 'CUSTOMER');
    
    // {"role":"ADMIN","exp":9999999999}
    const payloads: Record<UserRole, string> = {
      ADMIN: 'eyJyb2xlIjoiQURNSU4iLCJleHAiOjk5OTk5OTk5OTl9',
      SELLER: 'eyJyb2xlIjoiU0VMTEVSIiwiZXhwIjo5OTk5OTk5OTk5fQ==',
      CUSTOMER: 'eyJyb2xlIjoiQ1VTVE9NRVIiLCJleHAiOjk5OTk5OTk5OTl9'
    };

    const mockToken = `dummy.${payloads[mockRole]}.dummy`;

    return of({ token: mockToken, role: mockRole, username }).pipe(
      tap(res => {
        localStorage.setItem(this.TOKEN_KEY, res.token);
      })
    );
  }

  logout() {
    localStorage.removeItem(this.TOKEN_KEY);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  isLoggedIn(): boolean {
    const token = this.getToken();
    if (!token) return false;
    return !this.isTokenExpired(token);
  }

  getRole(): UserRole | null {
    const token = this.getToken();
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.role as UserRole;
    } catch {
      return null;
    }
  }

  private isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp * 1000 < Date.now();
    } catch {
      return true;
    }
  }
}

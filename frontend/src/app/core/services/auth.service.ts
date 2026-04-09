import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

export interface AuthUser {
  id: number;
  email: string;
  fullName: string;
  role: string;
}

export interface AuthResponse {
  accessToken: string;
  user: AuthUser;
  requires2fa?: boolean;
  tempToken?: string;
  message?: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private baseUrl = 'http://localhost:3000/api/auth';
  
  private currentUser = signal<AuthUser | null>(null);
  private token = signal<string | null>(null);

  readonly isLoggedIn = computed(() => !!this.token());
  readonly isAdmin = computed(() => this.currentUser()?.role === 'ADMIN');
  readonly user = computed(() => this.currentUser());

  constructor() {
    const storedToken = localStorage.getItem('stocklab_token');
    const storedUser = localStorage.getItem('stocklab_user');
    if (storedToken && storedUser) {
      this.token.set(storedToken);
      this.currentUser.set(JSON.parse(storedUser));
    }
  }

  getToken(): string | null {
    return this.token();
  }

  register(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/register`, data);
  }

  verifyOtp(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/verify-otp`, data);
  }

  login(data: any): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/login`, data).pipe(
      tap((res) => {
        if (!res.requires2fa && res.accessToken) {
          this.setSession(res);
        }
      })
    );
  }

  verify2Fa(tempToken: string, token: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/verify-2fa`, { tempToken, token }).pipe(
      tap((res) => {
        this.setSession(res);
      })
    );
  }
  
  forgotPassword(email: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/forgot-password`, { email });
  }

  resetPassword(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/reset-password`, data);
  }

  generate2FaSecret(): Observable<{ qrCodeUrl: string }> {
    return this.http.get<{ qrCodeUrl: string }>(`${this.baseUrl}/2fa/generate`);
  }

  turnOn2Fa(token: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/2fa/turn-on`, { token });
  }

  private setSession(res: AuthResponse) {
    this.token.set(res.accessToken);
    this.currentUser.set(res.user);
    localStorage.setItem('stocklab_token', res.accessToken);
    localStorage.setItem('stocklab_user', JSON.stringify(res.user));
  }

  logout(): void {
    this.token.set(null);
    this.currentUser.set(null);
    localStorage.removeItem('stocklab_token');
    localStorage.removeItem('stocklab_user');
  }
}

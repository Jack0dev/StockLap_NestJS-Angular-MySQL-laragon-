import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly baseUrl = 'http://localhost:3000/api/auth';

  constructor(private http: HttpClient) {}

  register(payload: { email: string; fullName: string; password: string }): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.baseUrl}/register`, payload);
  }

  login(payload: { email: string; password: string }): Observable<{ accessToken?: string; requires2FA?: boolean; userId?: number }> {
    return this.http.post<any>(`${this.baseUrl}/login`, payload).pipe(
      tap((res) => {
        if (res.accessToken) {
          localStorage.setItem('stocklab_token', res.accessToken);
        }
      }),
    );
  }

  loginWith2FA(userId: number, code: string): Observable<{ accessToken: string }> {
    return this.http.post<{ accessToken: string }>(`${this.baseUrl}/login/2fa/${userId}`, { code }).pipe(
      tap((res) => {
        if (res.accessToken) {
          localStorage.setItem('stocklab_token', res.accessToken);
        }
      }),
    );
  }

  generate2faQR(): Observable<{ qrCodeDataUrl: string }> {
    const user = this.getCurrentUser();
    return this.http.post<{ qrCodeDataUrl: string }>(`${this.baseUrl}/2fa/generate`, user);
  }

  turnOn2fa(code: string): Observable<{ message: string }> {
    const user = this.getCurrentUser();
    return this.http.post<{ message: string }>(`${this.baseUrl}/2fa/turn-on`, { userId: user?.id, code });
  }

  verify2faCode(code: string): Observable<{ accessToken: string }> {
    const userId = this.getCurrentUser()?.id;
    return this.loginWith2FA(userId!, code);
  }

  getToken(): string | null {
    return localStorage.getItem('stocklab_token');
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  logout(): void {
    localStorage.removeItem('stocklab_token');
  }

  private getCurrentUser(): { id: number; email: string } | null {
    const token = this.getToken();
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return { id: payload.sub, email: payload.email };
    } catch {
      return null;
    }
  }
}

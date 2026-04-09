import { Injectable, signal, computed } from '@angular/core';

export interface AuthUser {
  id: number;
  email: string;
  fullName: string;
  role: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private currentUser = signal<AuthUser | null>(null);
  private token = signal<string | null>(null);

  readonly isLoggedIn = computed(() => !!this.token());
  readonly isAdmin = computed(() => this.currentUser()?.role === 'ADMIN');
  readonly user = computed(() => this.currentUser());

  constructor() {
    // Load from localStorage on init
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

  /**
   * For development: auto-login as admin without real auth flow.
   * Will be replaced with real JWT auth later.
   */
  devLoginAsAdmin(): void {
    const mockAdmin: AuthUser = {
      id: 1,
      email: 'admin@stocklab.vn',
      fullName: 'Admin StockLab',
      role: 'ADMIN',
    };
    this.token.set('dev-admin-token');
    this.currentUser.set(mockAdmin);
    localStorage.setItem('stocklab_token', 'dev-admin-token');
    localStorage.setItem('stocklab_user', JSON.stringify(mockAdmin));
  }

  logout(): void {
    this.token.set(null);
    this.currentUser.set(null);
    localStorage.removeItem('stocklab_token');
    localStorage.removeItem('stocklab_user');
  }
}

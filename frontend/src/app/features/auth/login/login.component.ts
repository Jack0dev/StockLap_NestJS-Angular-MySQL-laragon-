import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="page-wrapper">
      <div class="glass-card auth-card">

        <!-- Logo/Brand -->
        <div class="brand">
          <div class="brand-icon">📈</div>
          <h1>StockLab</h1>
          <p class="brand-tagline">Nền tảng giao dịch chứng khoán mô phỏng</p>
        </div>

        <!-- Step 1: Email & Password -->
        <form *ngIf="step === 1" [formGroup]="loginForm" (ngSubmit)="onLogin()" class="auth-form">
          <h2>Đăng nhập</h2>

          <div class="field">
            <label for="email">Email</label>
            <input id="email" type="email" formControlName="email" placeholder="you@example.com">
            <span class="field-error" *ngIf="loginForm.get('email')?.touched && loginForm.get('email')?.invalid">
              Vui lòng nhập email hợp lệ.
            </span>
          </div>

          <div class="field">
            <label for="password">Mật khẩu</label>
            <div class="password-wrap">
              <input [type]="showPassword ? 'text' : 'password'" id="password" formControlName="password" placeholder="••••••••">
              <button type="button" class="toggle-password" (click)="showPassword = !showPassword">
                {{ showPassword ? '🙈' : '👁️' }}
              </button>
            </div>
          </div>

          <div *ngIf="errorMsg" class="alert-error">{{ errorMsg }}</div>

          <button type="submit" class="btn-primary" [disabled]="loginForm.invalid || isLoading">
            <span *ngIf="!isLoading">Đăng nhập</span>
            <span *ngIf="isLoading" class="loader"></span>
          </button>

          <p class="auth-link">Chưa có tài khoản? <a routerLink="/auth/register">Đăng ký ngay</a></p>
        </form>

        <!-- Step 2: 2FA OTP -->
        <div *ngIf="step === 2" class="otp-step">
          <div class="otp-icon">🔐</div>
          <h2>Xác minh 2FA</h2>
          <p>Nhập mã 6 số từ ứng dụng Google Authenticator</p>

          <form [formGroup]="otpForm" (ngSubmit)="onOtpVerify()" class="auth-form">
            <div class="field">
              <input id="otp" type="text" formControlName="code" maxlength="6" placeholder="000000" class="otp-input" autocomplete="one-time-code">
            </div>
            <div *ngIf="errorMsg" class="alert-error">{{ errorMsg }}</div>
            <button type="submit" class="btn-primary" [disabled]="otpForm.invalid || isLoading">
              <span *ngIf="!isLoading">Xác minh</span>
              <span *ngIf="isLoading" class="loader"></span>
            </button>
            <button type="button" class="btn-ghost" (click)="step = 1">← Quay lại</button>
          </form>
        </div>

      </div>
    </div>
  `,
  styles: [`
    .page-wrapper {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 80vh;
      padding: 24px;
    }
    .auth-card {
      width: 100%;
      max-width: 420px;
      padding: 48px 40px;
      animation: zoomIn 0.5s cubic-bezier(0.165, 0.84, 0.44, 1);
    }
    .brand { text-align: center; margin-bottom: 40px; }
    .brand-icon { font-size: 48px; margin-bottom: 8px; }
    h1 { font-size: 28px; font-weight: 800; letter-spacing: 1px; margin-bottom: 4px; }
    .brand-tagline { color: #94a3b8; font-size: 13px; }
    h2 { font-size: 20px; font-weight: 700; margin-bottom: 24px; text-align: center; }
    .auth-form { display: flex; flex-direction: column; gap: 20px; }
    .field { display: flex; flex-direction: column; gap: 6px; }
    .field label { font-size: 14px; font-weight: 500; color: #cbd5e1; }
    .field input {
      padding: 14px 16px;
      background: rgba(0,0,0,0.25);
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 12px;
      color: white;
      font-size: 15px;
      transition: border 0.3s;
      font-family: 'Outfit', sans-serif;
    }
    .field input:focus { border-color: #6366f1; outline: none; box-shadow: 0 0 0 3px rgba(99,102,241,0.15); }
    .field-error { font-size: 12px; color: #f87171; }
    .password-wrap { position: relative; }
    .password-wrap input { width: 100%; padding-right: 44px; }
    .toggle-password {
      position: absolute; right: 12px; top: 50%; transform: translateY(-50%);
      background: none; border: none; cursor: pointer; font-size: 16px;
    }
    .btn-primary { height: 50px; width: 100%; font-size: 16px; border-radius: 12px; }
    .btn-ghost {
      height: 44px; width: 100%; background: transparent; border: 1px solid rgba(255,255,255,0.1);
      color: #94a3b8; border-radius: 12px; cursor: pointer; font-family: 'Outfit', sans-serif;
      font-size: 14px; transition: all 0.2s;
    }
    .btn-ghost:hover { border-color: #6366f1; color: #a5b4fc; }
    .alert-error {
      background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.2);
      color: #fca5a5; padding: 12px; border-radius: 10px; font-size: 14px; text-align: center;
    }
    .auth-link { text-align: center; font-size: 14px; color: #64748b; }
    .auth-link a { color: #818cf8; text-decoration: none; font-weight: 600; }
    .auth-link a:hover { color: #a5b4fc; }
    .otp-step { text-align: center; display: flex; flex-direction: column; gap: 16px; }
    .otp-icon { font-size: 48px; }
    .otp-input {
      font-size: 32px; letter-spacing: 8px; text-align: center;
      font-family: 'Outfit', sans-serif; font-weight: 700; padding: 20px;
    }
    .loader {
      width: 20px; height: 20px; border: 2px solid rgba(255,255,255,0.3);
      border-top-color: white; border-radius: 50%; animation: spin 0.8s linear infinite;
      display: inline-block;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
    @keyframes zoomIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
  `]
})
export class LoginComponent {
  loginForm: FormGroup;
  otpForm: FormGroup;
  step = 1;
  pendingUserId: number | null = null;
  isLoading = false;
  errorMsg = '';
  showPassword = false;

  constructor(private fb: FormBuilder, private authService: AuthService, private router: Router) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]],
    });
    this.otpForm = this.fb.group({
      code: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(6), Validators.pattern('^[0-9]+$')]],
    });
  }

  onLogin(): void {
    if (this.loginForm.invalid) return;
    this.isLoading = true;
    this.errorMsg = '';
    this.authService.login(this.loginForm.value).subscribe({
      next: (res) => {
        this.isLoading = false;
        if (res.requires2FA && res.userId) {
          this.pendingUserId = res.userId;
          this.step = 2; // Hiện form OTP
        } else {
          this.router.navigate(['/dashboard']);
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMsg = err.error?.message || 'Email hoặc mật khẩu không đúng.';
      }
    });
  }

  onOtpVerify(): void {
    if (this.otpForm.invalid || !this.pendingUserId) return;
    this.isLoading = true;
    this.errorMsg = '';
    this.authService.loginWith2FA(this.pendingUserId, this.otpForm.value.code).subscribe({
      next: () => {
        this.isLoading = false;
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMsg = err.error?.message || 'Mã OTP không chính xác.';
      }
    });
  }
}

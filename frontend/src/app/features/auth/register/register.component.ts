import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="page-wrapper">
      <div class="glass-card auth-card">

        <div class="brand">
          <div class="brand-icon">📈</div>
          <h1>StockLab</h1>
          <p class="brand-tagline">Tạo tài khoản mới để bắt đầu giao dịch</p>
        </div>

        <form [formGroup]="registerForm" (ngSubmit)="onRegister()" class="auth-form">
          <h2>Đăng ký</h2>

          <div class="field">
            <label for="fullName">Họ và tên</label>
            <input id="fullName" type="text" formControlName="fullName" placeholder="Nguyễn Văn A">
            <span class="field-error" *ngIf="registerForm.get('fullName')?.touched && registerForm.get('fullName')?.invalid">
              Vui lòng nhập họ tên.
            </span>
          </div>

          <div class="field">
            <label for="email">Email</label>
            <input id="email" type="email" formControlName="email" placeholder="you@example.com">
            <span class="field-error" *ngIf="registerForm.get('email')?.touched && registerForm.get('email')?.invalid">
              Vui lòng nhập email hợp lệ.
            </span>
          </div>

          <div class="field">
            <label for="password">Mật khẩu</label>
            <div class="password-wrap">
              <input [type]="showPassword ? 'text' : 'password'" id="password" formControlName="password" placeholder="Tối thiểu 6 ký tự">
              <button type="button" class="toggle-password" (click)="showPassword = !showPassword">
                {{ showPassword ? '🙈' : '👁️' }}
              </button>
            </div>
            <div class="password-strength" *ngIf="registerForm.get('password')?.value">
              <div class="strength-bar">
                <div class="strength-fill" [style.width]="passwordStrength + '%'" [class]="strengthClass"></div>
              </div>
              <span [class]="strengthClass">{{ strengthLabel }}</span>
            </div>
          </div>

          <div *ngIf="errorMsg" class="alert-error">{{ errorMsg }}</div>
          <div *ngIf="successMsg" class="alert-success">{{ successMsg }}</div>

          <button type="submit" class="btn-primary" [disabled]="registerForm.invalid || isLoading">
            <span *ngIf="!isLoading">Tạo tài khoản</span>
            <span *ngIf="isLoading" class="loader"></span>
          </button>

          <p class="auth-link">Đã có tài khoản? <a routerLink="/auth/login">Đăng nhập</a></p>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .page-wrapper { display: flex; justify-content: center; align-items: center; min-height: 80vh; padding: 24px; }
    .auth-card { width: 100%; max-width: 420px; padding: 48px 40px; animation: zoomIn 0.5s cubic-bezier(0.165, 0.84, 0.44, 1); }
    .brand { text-align: center; margin-bottom: 40px; }
    .brand-icon { font-size: 48px; margin-bottom: 8px; }
    h1 { font-size: 28px; font-weight: 800; letter-spacing: 1px; margin-bottom: 4px; }
    .brand-tagline { color: #94a3b8; font-size: 13px; }
    h2 { font-size: 20px; font-weight: 700; margin-bottom: 24px; text-align: center; }
    .auth-form { display: flex; flex-direction: column; gap: 20px; }
    .field { display: flex; flex-direction: column; gap: 6px; }
    .field label { font-size: 14px; font-weight: 500; color: #cbd5e1; }
    .field input {
      padding: 14px 16px; background: rgba(0,0,0,0.25); border: 1px solid rgba(255,255,255,0.08);
      border-radius: 12px; color: white; font-size: 15px; transition: border 0.3s; font-family: 'Outfit', sans-serif;
    }
    .field input:focus { border-color: #6366f1; outline: none; box-shadow: 0 0 0 3px rgba(99,102,241,0.15); }
    .field-error { font-size: 12px; color: #f87171; }
    .password-wrap { position: relative; }
    .password-wrap input { width: 100%; padding-right: 44px; }
    .toggle-password { position: absolute; right: 12px; top: 50%; transform: translateY(-50%); background: none; border: none; cursor: pointer; font-size: 16px; }
    .password-strength { display: flex; align-items: center; gap: 8px; margin-top: 4px; }
    .strength-bar { flex: 1; height: 4px; background: rgba(255,255,255,0.1); border-radius: 2px; overflow: hidden; }
    .strength-fill { height: 100%; border-radius: 2px; transition: width 0.3s, background 0.3s; }
    .strength-fill.weak { background: #ef4444; }
    .strength-fill.medium { background: #f59e0b; }
    .strength-fill.strong { background: #10b981; }
    .weak { color: #ef4444; font-size: 12px; }
    .medium { color: #f59e0b; font-size: 12px; }
    .strong { color: #10b981; font-size: 12px; }
    .btn-primary { height: 50px; width: 100%; font-size: 16px; border-radius: 12px; }
    .alert-error { background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.2); color: #fca5a5; padding: 12px; border-radius: 10px; font-size: 14px; text-align: center; }
    .alert-success { background: rgba(16,185,129,0.1); border: 1px solid rgba(16,185,129,0.2); color: #6ee7b7; padding: 12px; border-radius: 10px; font-size: 14px; text-align: center; }
    .auth-link { text-align: center; font-size: 14px; color: #64748b; }
    .auth-link a { color: #818cf8; text-decoration: none; font-weight: 600; }
    .loader { width: 20px; height: 20px; border: 2px solid rgba(255,255,255,0.3); border-top-color: white; border-radius: 50%; animation: spin 0.8s linear infinite; display: inline-block; }
    @keyframes spin { to { transform: rotate(360deg); } }
    @keyframes zoomIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
  `]
})
export class RegisterComponent {
  registerForm: FormGroup;
  isLoading = false;
  errorMsg = '';
  successMsg = '';
  showPassword = false;

  constructor(private fb: FormBuilder, private authService: AuthService, private router: Router) {
    this.registerForm = this.fb.group({
      fullName: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  get passwordStrength(): number {
    const pwd = this.registerForm.get('password')?.value || '';
    if (pwd.length < 6) return 33;
    if (pwd.length < 10 || !/[A-Z]/.test(pwd)) return 66;
    return 100;
  }

  get strengthClass(): string {
    const s = this.passwordStrength;
    if (s <= 33) return 'weak';
    if (s <= 66) return 'medium';
    return 'strong';
  }

  get strengthLabel(): string {
    const s = this.passwordStrength;
    if (s <= 33) return 'Yếu';
    if (s <= 66) return 'Trung bình';
    return 'Mạnh';
  }

  onRegister(): void {
    if (this.registerForm.invalid) return;
    this.isLoading = true;
    this.errorMsg = '';
    this.successMsg = '';
    this.authService.register(this.registerForm.value).subscribe({
      next: (res) => {
        this.isLoading = false;
        this.successMsg = res.message;
        setTimeout(() => this.router.navigate(['/auth/login']), 2000);
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMsg = err.error?.message || 'Đã có lỗi xảy ra, vui lòng thử lại.';
      }
    });
  }
}

import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="auth-wrapper">
      <div class="auth-card">
        <div class="auth-header">
          <h2>Đăng Nhập StockLab</h2>
          <p>Chào mừng bạn trở lại hệ thống giả lập giao dịch</p>
        </div>
        
        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" *ngIf="!requires2fa">
          <div class="form-group">
            <label>Email</label>
            <input type="email" formControlName="email" placeholder="Nhập email của bạn" />
          </div>
          
          <div class="form-group">
            <label>Mật khẩu</label>
            <input type="password" formControlName="password" placeholder="Nhập mật khẩu" />
          </div>

          <div class="additional-links">
            <a routerLink="/auth/forgot-password">Quên mật khẩu?</a>
          </div>

          <button type="submit" [disabled]="loginForm.invalid || isLoading" class="btn-primary">
            {{ isLoading ? 'Đang xác thực...' : 'Đăng Nhập' }}
          </button>
          
          <div class="error-msg" *ngIf="errorMsg">{{ errorMsg }}</div>
        </form>

        <!-- 2FA Form -->
        <form [formGroup]="twoFaForm" (ngSubmit)="on2FaSubmit()" *ngIf="requires2fa">
          <div class="form-group">
            <label>Mã Google Authenticator (6 số)</label>
            <input type="text" formControlName="token" placeholder="000000" maxlength="6" />
          </div>
          <button type="submit" [disabled]="twoFaForm.invalid || isLoading" class="btn-primary">
            {{ isLoading ? 'Đang xác thực...' : 'Xác nhận' }}
          </button>
          <div class="error-msg" *ngIf="errorMsg">{{ errorMsg }}</div>
        </form>

        <div class="auth-footer" *ngIf="!requires2fa">
          Chưa có tài khoản? <a routerLink="/auth/register">Đăng ký ngay</a>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['../auth.shared.css']
})
export default class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  loginForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]]
  });

  twoFaForm: FormGroup = this.fb.group({
    token: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(6)]]
  });

  isLoading = false;
  errorMsg = '';
  requires2fa = false;
  tempToken = '';

  onSubmit() {
    if (this.loginForm.invalid) return;
    this.isLoading = true;
    this.errorMsg = '';

    this.authService.login(this.loginForm.value).subscribe({
      next: (res) => {
        this.isLoading = false;
        if (res.requires2fa) {
          this.requires2fa = true;
          this.tempToken = res.tempToken!;
        } else {
          this.router.navigate(['/market']);
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMsg = err.error?.message || 'Đăng nhập thất bại';
      }
    });
  }

  on2FaSubmit() {
    if (this.twoFaForm.invalid) return;
    this.isLoading = true;
    this.errorMsg = '';

    this.authService.verify2Fa(this.tempToken, this.twoFaForm.value.token).subscribe({
      next: () => {
        this.isLoading = false;
        this.router.navigate(['/market']);
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMsg = err.error?.message || 'Xác thực 2FA thất bại';
      }
    });
  }
}

import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="auth-wrapper">
      <div class="auth-card">
        <div class="auth-header">
          <h2>Quên Mật Khẩu</h2>
          <p>Nhập email để nhận mã OTP khôi phục mật khẩu</p>
        </div>
        
        <form [formGroup]="forgotForm" (ngSubmit)="onSubmit()">
          <div class="form-group">
            <label>Email</label>
            <input type="email" formControlName="email" placeholder="Nhập email của bạn" />
          </div>

          <button type="submit" [disabled]="forgotForm.invalid || isLoading" class="btn-primary">
            {{ isLoading ? 'Đang gửi...' : 'Nhận Mã OTP' }}
          </button>
          
          <div class="error-msg" *ngIf="errorMsg">{{ errorMsg }}</div>
        </form>

        <div class="auth-footer">
          <a routerLink="/auth/login">Quay lại đăng nhập</a>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['../auth.shared.css']
})
export default class ForgotPasswordComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  forgotForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]]
  });

  isLoading = false;
  errorMsg = '';

  onSubmit() {
    if (this.forgotForm.invalid) return;
    this.isLoading = true;
    this.errorMsg = '';

    const email = this.forgotForm.value.email;

    this.authService.forgotPassword(email).subscribe({
      next: () => {
        this.isLoading = false;
        this.router.navigate(['/auth/reset-password'], { queryParams: { email } });
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMsg = err.error?.message || 'Có lỗi xảy ra';
      }
    });
  }
}

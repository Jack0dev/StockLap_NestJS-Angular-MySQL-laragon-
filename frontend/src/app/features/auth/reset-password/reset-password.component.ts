import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="auth-wrapper">
      <div class="auth-card">
        <div class="auth-header">
          <h2>Tạo Mật Khẩu Mới</h2>
          <p>Nhập mã OTP và mật khẩu mới của bạn</p>
        </div>
        
        <form [formGroup]="resetForm" (ngSubmit)="onSubmit()">
          <div class="form-group">
            <label>Mã Xác Thực (OTP)</label>
            <input type="text" formControlName="otp" placeholder="000000" maxlength="6" />
          </div>

          <div class="form-group">
            <label>Mật khẩu mới</label>
            <input type="password" formControlName="newPassword" placeholder="Ít nhất 6 ký tự" />
          </div>

          <button type="submit" [disabled]="resetForm.invalid || isLoading" class="btn-primary">
            {{ isLoading ? 'Đang cập nhật...' : 'Cập Nhật Mật Khẩu' }}
          </button>
          
          <div class="error-msg" *ngIf="errorMsg">{{ errorMsg }}</div>
          <div class="success-msg" *ngIf="successMsg">{{ successMsg }}</div>
        </form>
      </div>
    </div>
  `,
  styleUrls: ['../auth.shared.css']
})
export default class ResetPasswordComponent implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  email = '';
  
  resetForm: FormGroup = this.fb.group({
    otp: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(6)]],
    newPassword: ['', [Validators.required, Validators.minLength(6)]]
  });

  isLoading = false;
  errorMsg = '';
  successMsg = '';

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      if (params['email']) {
        this.email = params['email'];
      }
    });
  }

  onSubmit() {
    if (this.resetForm.invalid) return;
    this.isLoading = true;
    this.errorMsg = '';

    const payload = {
      email: this.email,
      otp: this.resetForm.value.otp,
      newPassword: this.resetForm.value.newPassword
    };

    this.authService.resetPassword(payload).subscribe({
      next: () => {
        this.isLoading = false;
        this.successMsg = 'Đổi mật khẩu thành công! Giờ bạn có thể đăng nhập.';
        setTimeout(() => this.router.navigate(['/auth/login']), 1500);
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMsg = err.error?.message || 'Có lỗi xảy ra hoặc mã OTP sai';
      }
    });
  }
}

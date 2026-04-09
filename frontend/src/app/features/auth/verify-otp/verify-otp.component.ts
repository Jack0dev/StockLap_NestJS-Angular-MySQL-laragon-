import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-verify-otp',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="auth-wrapper">
      <div class="auth-card">
        <div class="auth-header">
          <h2>Xác thực Email</h2>
          <p>Mã OTP (6 chữ số) đã được gửi đến email của bạn</p>
          <small *ngIf="email" class="email-badge">{{ email }}</small>
        </div>
        
        <form [formGroup]="otpForm" (ngSubmit)="onSubmit()">
          <div class="form-group">
            <label>Mã Xác Thực (OTP)</label>
            <input type="text" formControlName="otp" placeholder="000000" maxlength="6" class="text-center text-lg tracking-widest" />
          </div>

          <button type="submit" [disabled]="otpForm.invalid || isLoading" class="btn-primary">
            {{ isLoading ? 'Đang xác thực...' : 'Kích hoạt tài khoản' }}
          </button>
          
          <div class="error-msg" *ngIf="errorMsg">{{ errorMsg }}</div>
          <div class="success-msg" *ngIf="successMsg">{{ successMsg }}</div>
        </form>

        <div class="auth-footer">
          <a routerLink="/auth/login">Quay lại đăng nhập</a>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['../auth.shared.css'],
  styles: [`
    .email-badge {
      display: inline-block;
      margin-top: 5px;
      padding: 4px 8px;
      background: #1e222d;
      border-radius: 4px;
      color: #2962ff;
    }
    .text-center { text-align: center; }
    .text-lg { font-size: 1.5rem !important; }
    .tracking-widest { letter-spacing: 0.5em; }
  `]
})
export default class VerifyOtpComponent implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  email = '';
  
  otpForm: FormGroup = this.fb.group({
    otp: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(6)]]
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
    if (this.otpForm.invalid) return;
    if (!this.email) {
      this.errorMsg = 'Hệ thống không tìm thấy email cần xác thực';
      return;
    }

    this.isLoading = true;
    this.errorMsg = '';
    this.successMsg = '';

    const payload = {
      email: this.email,
      otp: this.otpForm.value.otp
    };

    this.authService.verifyOtp(payload).subscribe({
      next: (res) => {
        this.isLoading = false;
        this.successMsg = 'Kích hoạt thành công! Đang chuyển hướng...';
        setTimeout(() => {
          this.router.navigate(['/auth/login']);
        }, 1500);
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMsg = err.error?.message || 'Mã OTP không hợp lệ';
      }
    });
  }
}

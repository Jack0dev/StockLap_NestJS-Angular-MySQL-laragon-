import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="auth-wrapper">
      <div class="auth-card">
        <div class="auth-header">
          <h2>Đăng Ký Tài Khoản</h2>
          <p>Tạo tài khoản để tham gia thị trường</p>
        </div>
        
        <form [formGroup]="registerForm" (ngSubmit)="onSubmit()">
          <div class="form-group">
            <label>Họ và Tên</label>
            <input type="text" formControlName="fullName" placeholder="Nguyễn Văn A" />
          </div>

          <div class="form-group">
            <label>Email</label>
            <input type="email" formControlName="email" placeholder="example@email.com" />
          </div>
          
          <div class="form-group">
            <label>Mật khẩu</label>
            <input type="password" formControlName="password" placeholder="Tối thiểu 6 ký tự" />
          </div>

          <button type="submit" [disabled]="registerForm.invalid || isLoading" class="btn-primary">
            {{ isLoading ? 'Đang xử lý...' : 'Tạo Tài Khoản' }}
          </button>
          
          <div class="error-msg" *ngIf="errorMsg">{{ errorMsg }}</div>
        </form>

        <div class="auth-footer">
          Đã có tài khoản? <a routerLink="/auth/login">Đăng nhập ngay</a>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['../auth.shared.css']
})
export default class RegisterComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  registerForm: FormGroup = this.fb.group({
    fullName: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  isLoading = false;
  errorMsg = '';

  onSubmit() {
    if (this.registerForm.invalid) return;
    this.isLoading = true;
    this.errorMsg = '';

    this.authService.register(this.registerForm.value).subscribe({
      next: () => {
        this.isLoading = false;
        // Pwd encoded, pass email to verify screen
        this.router.navigate(['/auth/verify-otp'], { queryParams: { email: this.registerForm.value.email } });
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMsg = err.error?.message || 'Đăng ký thất bại. Vui lòng thử lại';
      }
    });
  }
}

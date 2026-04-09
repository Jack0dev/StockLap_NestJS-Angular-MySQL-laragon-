import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-verify-2fa',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="page-wrapper">
      <div class="glass-card verify-card" [ngClass]="{'shake': isError}">
        <div class="header">
          <div class="avatar-logo">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="shield-icon">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
            </svg>
          </div>
          <h1>Xác minh danh tính</h1>
          <p class="subtitle">Bảo vệ tài khoản của bạn bằng mã 2FA</p>
        </div>

        <form [formGroup]="verifyForm" (ngSubmit)="onSubmit()" class="verify-form">
          <div class="otp-container">
            <label for="code">Nhập mã Google Authenticator</label>
            <input 
              id="code" 
              type="text" 
              formControlName="code" 
              maxlength="6" 
              placeholder="000 000" 
              autocomplete="one-time-code"
              [ngClass]="{'invalid': isError}"
              #codeInput
            >
          </div>

          <button type="submit" class="btn-primary" [disabled]="verifyForm.invalid || isSubmitting">
            <span *ngIf="!isSubmitting">Xác minh bảo mật</span>
            <span *ngIf="isSubmitting" class="loader"></span>
          </button>
        </form>

        <div class="footer-note">
          <p *ngIf="!message">Chương trình yêu cầu kiểm tra định danh mỗi khi bạn đăng nhập.</p>
          <div *ngIf="message" class="message-box" [ngClass]="{'success': !isError, 'error': isError}">
            <svg *ngIf="!isError" class="status-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"></polyline></svg>
            <svg *ngIf="isError" class="status-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>
            {{ message }}
          </div>
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
    .verify-card {
      width: 100%;
      max-width: 440px;
      padding: 48px;
      animation: zoomIn 0.5s cubic-bezier(0.165, 0.84, 0.44, 1);
    }
    .avatar-logo {
      width: 72px;
      height: 72px;
      background: linear-gradient(135deg, rgba(99, 102, 241, 0.2) 0%, rgba(236, 72, 153, 0.2) 100%);
      border-radius: 20px;
      display: flex;
      justify-content: center;
      align-items: center;
      margin: 0 auto 24px;
      border: 1px solid rgba(255, 255, 255, 0.1);
    }
    .shield-icon {
      width: 36px;
      height: 36px;
      color: #818cf8;
    }
    .header { text-align: center; margin-bottom: 40px; }
    h1 { font-size: 26px; font-weight: 700; color: #fff; margin-bottom: 12px; }
    .subtitle { color: #94a3b8; font-size: 15px; }

    .verify-form { display: flex; flex-direction: column; gap: 32px; }
    .otp-container { display: flex; flex-direction: column; gap: 12px; }
    .otp-container label { font-size: 14px; color: #cbd5e1; text-align: center; font-weight: 500; }
    
    input {
      font-size: 32px;
      font-family: 'Outfit', sans-serif;
      font-weight: 700;
      text-align: center;
      letter-spacing: 8px;
      padding: 20px;
      background: rgba(15, 23, 42, 0.4);
      border: 2px solid rgba(255, 255, 255, 0.05);
      border-radius: 16px;
      color: white;
      transition: all 0.3s;
    }
    input:focus {
      border-color: #6366f1;
      background: rgba(15, 23, 42, 0.6);
      box-shadow: 0 0 20px rgba(99, 102, 241, 0.2);
    }
    input.invalid {
      border-color: #ef4444;
      background: rgba(239, 68, 68, 0.05);
    }

    .btn-primary { width: 100%; height: 56px; font-size: 17px; border-radius: 16px; }

    .footer-note { margin-top: 32px; text-align: center; font-size: 13px; color: #64748b; }
    
    .message-box {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12px;
      padding: 16px;
      border-radius: 16px;
      font-size: 14px;
      font-weight: 600;
    }
    .status-icon { width: 20px; height: 20px; }
    .success { color: #10b981; background: rgba(16, 185, 129, 0.1); }
    .error { color: #ef4444; background: rgba(239, 68, 68, 0.1); }

    .shake { animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both; }
    @keyframes shake {
      10%, 90% { transform: translate3d(-1px, 0, 0); }
      20%, 80% { transform: translate3d(2px, 0, 0); }
      30%, 50%, 70% { transform: translate3d(-4px, 0, 0); }
      40%, 60% { transform: translate3d(4px, 0, 0); }
    }
    @keyframes zoomIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
    
    .loader {
      width: 24px;
      height: 24px;
      border: 3px solid rgba(255,255,255,0.2);
      border-top-color: #fff;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
  `]
})
export class Verify2faComponent {
  verifyForm: FormGroup;
  message: string = '';
  isError: boolean = false;
  isSubmitting: boolean = false;

  constructor(private fb: FormBuilder, private authService: AuthService) {
    this.verifyForm = this.fb.group({
      code: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(6), Validators.pattern('^[0-9]+$')]]
    });
  }

  onSubmit(): void {
    if (this.verifyForm.valid) {
      this.isSubmitting = true;
      this.isError = false;
      this.message = '';
      const code = this.verifyForm.value.code;
      
      this.authService.verify2faCode(code).subscribe({
        next: (res) => {
          this.isSubmitting = false;
          this.message = 'Xác minh thành công! Đang chuyển hướng...';
          // Logic chuyển hướng sẽ được thêm ở đây
        },
        error: (err) => {
          this.isSubmitting = false;
          this.isError = true;
          this.message = 'Mã xác thực không hợp lệ, vui lòng thử lại.';
          setTimeout(() => { this.isError = false; }, 1000);
        }
      });
    }
  }
}

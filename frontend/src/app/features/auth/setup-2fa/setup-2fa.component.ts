import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-setup-2fa',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="page-wrapper">
      <div class="glass-card setup-card">
        <div class="header">
          <div class="icon-circle">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lock-icon">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
            </svg>
          </div>
          <h1>Bảo mật 2 lớp</h1>
          <p class="subtitle">Quét mã QR để kích hoạt Google Authenticator</p>
        </div>

        <div class="content">
          <div *ngIf="qrCodeUrl; else loading" class="qr-section">
            <div class="qr-container">
              <img [src]="qrCodeUrl" alt="2FA QR Code" class="qr-code">
              <div class="corner t-l"></div>
              <div class="corner t-r"></div>
              <div class="corner b-l"></div>
              <div class="corner b-r"></div>
            </div>
            
            <form [formGroup]="codeForm" (ngSubmit)="onSubmit()" class="setup-form">
              <div class="input-group">
                <label for="code">Nhập mã xác thực của bạn</label>
                <input id="code" type="text" formControlName="code" maxlength="6" placeholder="000000" autocomplete="off">
                <p class="hint">Nhập 6 con số từ ứng dụng Authenticator</p>
              </div>
              
              <button type="submit" class="btn-primary" [disabled]="codeForm.invalid || isSubmitting">
                <span *ngIf="!isSubmitting">Kích hoạt ngay</span>
                <span *ngIf="isSubmitting" class="loader"></span>
              </button>
            </form>
          </div>
          
          <ng-template #loading>
            <div class="loading-state">
              <div class="spinner"></div>
              <p>Đang khởi tạo mã bảo mật...</p>
            </div>
          </ng-template>

          <div *ngIf="message" class="toast" [ngClass]="{'success': !isError, 'error': isError}">
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
      padding: 20px;
    }
    .setup-card {
      width: 100%;
      max-width: 480px;
      padding: 40px;
      animation: fadeIn 0.8s ease-out;
    }
    .header {
      text-align: center;
      margin-bottom: 32px;
    }
    .icon-circle {
      width: 64px;
      height: 64px;
      background: rgba(99, 102, 241, 0.1);
      border-radius: 50%;
      display: flex;
      justify-content: center;
      align-items: center;
      margin: 0 auto 16px;
      border: 1px solid rgba(99, 102, 241, 0.2);
    }
    .lock-icon {
      width: 32px;
      height: 32px;
      color: #6366f1;
    }
    h1 {
      font-size: 24px;
      font-weight: 700;
      margin-bottom: 8px;
    }
    .subtitle {
      color: #94a3b8;
      font-size: 14px;
    }
    .qr-section {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 32px;
    }
    .qr-container {
      position: relative;
      padding: 16px;
      background: white;
      border-radius: 16px;
      box-shadow: 0 0 20px rgba(0,0,0,0.2);
    }
    .qr-code {
      display: block;
      width: 200px;
      height: 200px;
    }
    .corner {
      position: absolute;
      width: 20px;
      height: 20px;
      border: 3px solid #6366f1;
    }
    .t-l { top: -2px; left: -2px; border-right: 0; border-bottom: 0; border-top-left-radius: 12px; }
    .t-r { top: -2px; right: -2px; border-left: 0; border-bottom: 0; border-top-right-radius: 12px; }
    .b-l { bottom: -2px; left: -2px; border-right: 0; border-top: 0; border-bottom-left-radius: 12px; }
    .b-r { bottom: -2px; right: -2px; border-left: 0; border-top: 0; border-bottom-right-radius: 12px; }

    .setup-form {
      width: 100%;
      display: flex;
      flex-direction: column;
      gap: 24px;
    }
    .input-group {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .input-group label {
      font-size: 14px;
      font-weight: 500;
      color: #e2e8f0;
    }
    .input-group input {
      font-size: 24px;
      letter-spacing: 4px;
      text-align: center;
      font-family: monospace;
      padding: 16px;
    }
    .hint {
      font-size: 12px;
      color: #64748b;
      text-align: center;
    }
    .btn-primary {
      width: 100%;
      height: 50px;
    }
    .toast {
      margin-top: 24px;
      padding: 12px;
      border-radius: 12px;
      text-align: center;
      font-size: 14px;
      animation: slideUp 0.3s ease-out;
    }
    .toast.success { background: rgba(16, 185, 129, 0.1); color: #10b981; border: 1px solid rgba(16, 185, 129, 0.2); }
    .toast.error { background: rgba(239, 68, 68, 0.1); color: #ef4444; border: 1px solid rgba(239, 68, 68, 0.2); }

    @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes slideUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
    
    .loading-state {
      text-align: center;
      padding: 40px 0;
    }
    .spinner {
      width: 40px;
      height: 40px;
      border: 3px solid rgba(255,255,255,0.1);
      border-top-color: #6366f1;
      border-radius: 50%;
      margin: 0 auto 16px;
      animation: spin 1s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
    
    .loader {
      width: 20px;
      height: 20px;
      border: 2px solid rgba(255,255,255,0.3);
      border-top-color: #fff;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }
  `]
})
export class Setup2faComponent implements OnInit {
  qrCodeUrl: string | null = null;
  codeForm: FormGroup;
  message: string = '';
  isError: boolean = false;
  isSubmitting: boolean = false;

  constructor(private fb: FormBuilder, private authService: AuthService) {
    this.codeForm = this.fb.group({
      code: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(6), Validators.pattern('^[0-9]+$')]]
    });
  }

  ngOnInit(): void {
    this.authService.generate2faQR().subscribe({
      next: (res) => {
        this.qrCodeUrl = res.qrCodeDataUrl;
      },
      error: (err) => {
        console.error('Error generating QR', err);
        this.isError = true;
        this.message = 'Không thể tải mã QR. Vui lòng thử lại sau.';
      }
    });
  }

  onSubmit(): void {
    if (this.codeForm.valid) {
      this.isSubmitting = true;
      this.message = '';
      const code = this.codeForm.value.code;
      this.authService.turnOn2fa(code).subscribe({
        next: (res) => {
          this.isSubmitting = false;
          this.isError = false;
          this.message = 'Chúc mừng! Bạn đã kích hoạt 2FA thành công.';
        },
        error: (err) => {
          this.isSubmitting = false;
          this.isError = true;
          this.message = 'Mã xác thực không chính xác. Hãy kiểm tra lại ứng dụng!';
        }
      });
    }
  }
}

import { TestBed } from '@angular/core/testing';
import { Setup2faComponent } from './setup-2fa.component';
import { AuthService } from '../../../core/services/auth.service';
import { ReactiveFormsModule } from '@angular/forms';
import { of } from 'rxjs';

describe('Setup2faComponent', () => {
  let component: Setup2faComponent;
  let mockAuthService: any;

  beforeEach(async () => {
    mockAuthService = {
      generate2faQR: vi.fn().mockReturnValue(of({ qrCodeDataUrl: 'mock_qr_url' })),
      turnOn2fa: vi.fn().mockReturnValue(of({ message: 'Success' })),
      verify2faCode: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [Setup2faComponent, ReactiveFormsModule],
      providers: [
        { provide: AuthService, useValue: mockAuthService }
      ]
    }).compileComponents();

    const fixture = TestBed.createComponent(Setup2faComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should fetch QR code on init', () => {
    expect(mockAuthService.generate2faQR).toHaveBeenCalled();
    expect(component.qrCodeUrl).toBe('mock_qr_url');
  });

  it('should call turnOn2fa on submit with valid code', () => {
    component.codeForm.controls['code'].setValue('123456');
    component.onSubmit();

    expect(mockAuthService.turnOn2fa).toHaveBeenCalledWith('123456');
    expect(component.message).toBe('Success');
  });

  it('should not submit with invalid code', () => {
    component.codeForm.controls['code'].setValue('12');
    component.onSubmit();

    expect(mockAuthService.turnOn2fa).not.toHaveBeenCalled();
  });
});

import { TestBed } from '@angular/core/testing';
import { Verify2faComponent } from './verify-2fa.component';
import { AuthService } from '../../../core/services/auth.service';
import { ReactiveFormsModule } from '@angular/forms';
import { of, throwError } from 'rxjs';

describe('Verify2faComponent', () => {
  let component: Verify2faComponent;
  let mockAuthService: any;

  beforeEach(async () => {
    mockAuthService = {
      generate2faQR: vi.fn(),
      turnOn2fa: vi.fn(),
      verify2faCode: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [Verify2faComponent, ReactiveFormsModule],
      providers: [
        { provide: AuthService, useValue: mockAuthService }
      ]
    }).compileComponents();

    const fixture = TestBed.createComponent(Verify2faComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should verify code successfully', () => {
    mockAuthService.verify2faCode.mockReturnValue(of({ token: 'mock-jwt' }));

    component.verifyForm.controls['code'].setValue('123456');
    component.onSubmit();

    expect(mockAuthService.verify2faCode).toHaveBeenCalledWith('123456');
    expect(component.message).toContain('mock-jwt');
    expect(component.isError).toBe(false);
  });

  it('should display error when code is invalid', () => {
    mockAuthService.verify2faCode.mockReturnValue(throwError(() => new Error('Invalid code')));

    component.verifyForm.controls['code'].setValue('111111');
    component.onSubmit();

    expect(mockAuthService.verify2faCode).toHaveBeenCalledWith('111111');
    expect(component.isError).toBe(true);
  });

  it('should not submit with empty code', () => {
    component.verifyForm.controls['code'].setValue('');
    component.onSubmit();

    expect(mockAuthService.verify2faCode).not.toHaveBeenCalled();
  });
});

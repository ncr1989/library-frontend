import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Router } from '@angular/router';
import { authGuard } from './auth-guard';
import { AuthService } from '../services/auth';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

describe('authGuard', () => {
  let isLoggedInValue = true;

  const authServiceMock = {
    isLoggedIn: () => isLoggedInValue
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: authServiceMock }
      ]
    });
  });

  it('devrait autoriser l\'accès quand l\'utilisateur est connecté', () => {
    isLoggedInValue = true;
    const result = TestBed.runInInjectionContext(() =>
      authGuard({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot)
    );
    expect(result).toBe(true);
  });

  it('devrait refuser l\'accès quand l\'utilisateur n\'est pas connecté', () => {
    isLoggedInValue = false;
    const result = TestBed.runInInjectionContext(() =>
      authGuard({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot)
    );
    expect(result).toBe(false);
  });
});

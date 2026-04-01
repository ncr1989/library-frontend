import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { authGuard } from './auth-guard';
import { AuthService } from '../services/auth';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('authGuard', () => {
  let router: Router;
  let isLoggedInValue = true;

  const authServiceMock = {
    isLoggedIn: vi.fn(() => isLoggedInValue)
  };

  beforeEach(() => {
    isLoggedInValue = true;
    authServiceMock.isLoggedIn.mockClear();
    
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),  // Empty routes - we'll mock navigation
        { provide: AuthService, useValue: authServiceMock }
      ]
    });
    
    router = TestBed.inject(Router);
    // Mock navigate to prevent actual navigation
    vi.spyOn(router, 'navigate').mockResolvedValue(true);
  });

  it('devrait autoriser l\'accès quand l\'utilisateur est connecté', () => {
    isLoggedInValue = true;
    
    const result = TestBed.runInInjectionContext(() =>
      authGuard({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot)
    );
    
    expect(result).toBe(true);
    expect(authServiceMock.isLoggedIn).toHaveBeenCalled();
  });

  it('devrait refuser l\'accès quand l\'utilisateur n\'est pas connecté', () => {
    isLoggedInValue = false;
    
    const result = TestBed.runInInjectionContext(() =>
      authGuard({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot)
    );
    
    expect(result).toBe(false);
    expect(authServiceMock.isLoggedIn).toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('devrait rediriger vers /login quand l\'utilisateur n\'est pas connecté', () => {
    isLoggedInValue = false;
    
    TestBed.runInInjectionContext(() =>
      authGuard({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot)
    );
    
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  });
});
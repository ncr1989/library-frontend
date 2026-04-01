import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { AuthService } from './auth';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        AuthService,
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([{ path: '**', redirectTo: '' }])
      ]
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
    localStorage.clear();
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('devrait être créé', () => {
    expect(service).toBeTruthy();
  });

  it('devrait stocker le token dans le localStorage après connexion', () => {
    service.login('admin@mail.com', 'admin123').subscribe();
    const req = httpMock.expectOne('http://localhost:8080/api/auth/login');
    req.flush({ token: 'fake-token', role: 'ADMIN', nom: 'Admin', prenom: 'Super', id: '1', caution: 10 });
    expect(localStorage.getItem('token')).toBe('fake-token');
    expect(localStorage.getItem('role')).toBe('ADMIN');
  });

  it('devrait vider le localStorage lors de la déconnexion', () => {
    localStorage.setItem('token', 'un-token');
    service.logout();
    expect(localStorage.getItem('token')).toBeNull();
  });

  it('devrait retourner true si un token est présent', () => {
    localStorage.setItem('token', 'un-token');
    expect(service.isLoggedIn()).toBe(true);
  });

  it('devrait retourner false si aucun token n\'est présent', () => {
    expect(service.isLoggedIn()).toBe(false);
  });

  it('devrait retourner true pour isAdmin() quand le rôle est ADMIN', () => {
    localStorage.setItem('role', 'ADMIN');
    expect(service.isAdmin()).toBe(true);
  });

  it('devrait retourner false pour isAdmin() quand le rôle est ETUDIANT', () => {
    localStorage.setItem('role', 'ETUDIANT');
    expect(service.isAdmin()).toBe(false);
  });

  it('devrait retourner la caution parsée depuis le localStorage', () => {
    localStorage.setItem('caution', '15.5');
    expect(service.getCaution()).toBe(15.5);
  });

  it('devrait retourner 0 pour getCaution() quand aucune valeur n\'est stockée', () => {
    expect(service.getCaution()).toBe(0);
  });
});

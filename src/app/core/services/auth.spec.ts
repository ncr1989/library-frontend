import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { AuthService } from './auth';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, RouterTestingModule],
      providers: [AuthService]
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

  describe('login()', () => {
    it('devrait stocker le token et les infos utilisateur dans le localStorage après connexion réussie', () => {
      const mockReponse = {
        token: 'fake-jwt-token',
        role: 'ADMIN',
        nom: 'Admin',
        prenom: 'Super',
        id: '1',
        caution: 10.0
      };

      service.login('admin@mail.com', 'admin123').subscribe();

      const req = httpMock.expectOne('http://localhost:8080/api/auth/login');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ email: 'admin@mail.com', password: 'admin123' });
      req.flush(mockReponse);

      
      expect(localStorage.getItem('token')).toBe('fake-jwt-token');
      expect(localStorage.getItem('role')).toBe('ADMIN');
      expect(localStorage.getItem('nom')).toBe('Admin');
      expect(localStorage.getItem('prenom')).toBe('Super');
      expect(localStorage.getItem('userId')).toBe('1');
      expect(localStorage.getItem('caution')).toBe('10');
    });

    it('devrait envoyer les identifiants corrects dans le corps de la requête', () => {
      service.login('user@mail.com', 'motdepasse').subscribe();
      const req = httpMock.expectOne('http://localhost:8080/api/auth/login');
      expect(req.request.body).toEqual({ email: 'user@mail.com', password: 'motdepasse' });
      req.flush({ token: 't', role: 'ETUDIANT', nom: 'A', prenom: 'B', id: '2', caution: 5 });
    });
  });

  describe('logout()', () => {
    it('devrait vider le localStorage lors de la déconnexion', () => {
      
      localStorage.setItem('token', 'un-token');
      localStorage.setItem('role', 'ADMIN');
      service.logout();
      
      expect(localStorage.getItem('token')).toBeNull();
      expect(localStorage.getItem('role')).toBeNull();
    });
  });

  

  import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { AuthService } from './auth';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, RouterTestingModule],
      providers: [AuthService]
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

  it('devrait retourner 0 pour getCaution() quand aucune valeur n\'est stockée', () => {
    expect(service.getCaution()).toBe(0);
  });

  it('devrait retourner la caution stockée dans le localStorage', () => {
    localStorage.setItem('caution', '15.5');
    expect(service.getCaution()).toBe(15.5);
  });
});

  describe('getRole()', () => {
    it('devrait retourner le rôle stocké dans le localStorage', () => {
      localStorage.setItem('role', 'ETUDIANT');
      expect(service.getRole()).toBe('ETUDIANT');
    });

    it('devrait retourner une chaîne vide quand aucun rôle n\'est stocké', () => {
      expect(service.getRole()).toBe('');
    });
  });

  

  describe('getNom()', () => {
    it('devrait retourner le nom stocké dans le localStorage', () => {
      localStorage.setItem('nom', 'Dupont');
      expect(service.getNom()).toBe('Dupont');
    });

    it('devrait retourner une chaîne vide quand aucun nom n\'est stocké', () => {
      expect(service.getNom()).toBe('');
    });
  });

  describe('getUserId()', () => {
    it('devrait retourner l\'identifiant utilisateur stocké', () => {
      localStorage.setItem('userId', '42');
      expect(service.getUserId()).toBe('42');
    });
  });

  describe('getCaution()', () => {
    it('devrait retourner la caution parsée depuis le localStorage', () => {
      localStorage.setItem('caution', '15.5');
      expect(service.getCaution()).toBe(15.5);
    });

    it('devrait retourner 0 quand aucune caution n\'est stockée', () => {
      expect(service.getCaution()).toBe(0);
    });
  });
});
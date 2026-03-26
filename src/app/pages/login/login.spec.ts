import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { of, throwError } from 'rxjs';
import { Login } from './login';
import { AuthService } from '../../core/services/auth';

describe('Login', () => {
  let composant: Login;
  let fixture: ComponentFixture<Login>;
  let authService: jasmine.SpyObj<AuthService>;

  beforeEach(async () => {
    
    authService = jasmine.createSpyObj('AuthService', ['login'])
    await TestBed.configureTestingModule({
      imports: [Login, RouterTestingModule],
      providers: [{ provide: AuthService, useValue: authService }]
    }).compileComponents();

    fixture = TestBed.createComponent(Login);
    composant = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('devrait être créé', () => {
    expect(composant).toBeTruthy();
  });

  it('devrait afficher une erreur quand les deux champs sont vides', () => {
    composant.email = '';
    composant.password = '';
    composant.onSubmit();
    expect(composant.errorMessage).toBe('Veuillez remplir tous les champs.');
  });

  it('devrait afficher une erreur quand seul l\'email est vide', () => {
    composant.email = '';
    composant.password = 'motdepasse123';
    composant.onSubmit();
    expect(composant.errorMessage).toBe('Veuillez remplir tous les champs.');
  });

  it('devrait afficher une erreur quand seul le mot de passe est vide', () => {
    composant.email = 'test@mail.com';
    composant.password = '';
    composant.onSubmit();
    expect(composant.errorMessage).toBe('Veuillez remplir tous les champs.');
  });

  it('devrait appeler authService.login avec les bons identifiants', () => {
    authService.login.and.returnValue(of({}));
    composant.email = 'admin@mail.com';
    composant.password = 'admin123';
    composant.onSubmit();
    expect(authService.login).toHaveBeenCalledWith('admin@mail.com', 'admin123');
  });

  

  

  it('devrait effacer le message d\'erreur précédent avant de soumettre', () => {
    authService.login.and.returnValue(of({}));
    
    composant.errorMessage = 'Ancienne erreur';
    composant.email = 'admin@mail.com';
    composant.password = 'admin123';
    composant.onSubmit();
    expect(composant.errorMessage).toBe('');
  });

  it('devrait passer loading à true pendant l\'appel', () => {
    authService.login.and.returnValue(of({}));
    composant.email = 'admin@mail.com';
    composant.password = 'admin123';
    composant.onSubmit();
    expect(authService.login).toHaveBeenCalled();
  });
});
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { of, throwError } from 'rxjs';
import { Login } from './login';
import { AuthService } from '../../core/services/auth';

describe('Login', () => {
  let composant: Login;
  let fixture: ComponentFixture<Login>;
  let authService: jasmine.SpyObj<AuthService>;

  beforeEach(async () => {
    authService = jasmine.createSpyObj('AuthService', ['login']);
    await TestBed.configureTestingModule({
      imports: [Login, RouterTestingModule],
      providers: [{ provide: AuthService, useValue: authService }]
    }).compileComponents();
    fixture = TestBed.createComponent(Login);
    composant = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('devrait être créé', () => {
    expect(composant).toBeTruthy();
  });

  it('devrait afficher une erreur si les champs sont vides', () => {
    composant.email = '';
    composant.password = '';
    composant.onSubmit();
    expect(composant.errorMessage).toBe('Veuillez remplir tous les champs.');
  });

  it('devrait appeler authService.login avec les bons identifiants', () => {
    authService.login.and.returnValue(of({}));
    composant.email = 'admin@mail.com';
    composant.password = 'admin123';
    composant.onSubmit();
    expect(authService.login).toHaveBeenCalledWith('admin@mail.com', 'admin123');
  });

  it('devrait afficher une erreur 401 pour des identifiants incorrects', () => {
    authService.login.and.returnValue(throwError(() => ({ status: 401 })));
    composant.email = 'mauvais@mail.com';
    composant.password = 'mauvais';
    composant.onSubmit();
    expect(composant.errorMessage).toBe('Email ou mot de passe incorrect.');
  });

  it('devrait afficher une erreur générique pour toute autre erreur serveur', () => {
    authService.login.and.returnValue(throwError(() => ({ status: 500 })));
    composant.email = 'test@mail.com';
    composant.password = 'test123';
    composant.onSubmit();
    expect(composant.errorMessage).toBe('Une erreur est survenue. Réessayez.');
  });
});
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { Login } from './login';
import { AuthService } from '../../core/services/auth';

describe('Login', () => {
  let composant: Login;
  let fixture: ComponentFixture<Login>;
  let loginResult: any = of({});

  const authServiceMock = {
    login: (_email: string, _password: string) => loginResult
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Login],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: authServiceMock }
      ]
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

  it('devrait afficher une erreur 401 pour des identifiants incorrects', () => {
    loginResult = throwError(() => ({ status: 401 }));
    composant.email = 'mauvais@mail.com';
    composant.password = 'mauvais';
    composant.onSubmit();
    expect(composant.errorMessage).toBe('Email ou mot de passe incorrect.');
  });

  it('devrait afficher une erreur générique pour toute autre erreur serveur', () => {
    loginResult = throwError(() => ({ status: 500 }));
    composant.email = 'test@mail.com';
    composant.password = 'test123';
    composant.onSubmit();
    expect(composant.errorMessage).toBe('Une erreur est survenue. Réessayez.');
  });

  it('devrait effacer le message d\'erreur précédent avant de soumettre', () => {
    loginResult = of({});
    composant.errorMessage = 'ancienne erreur';
    composant.email = 'admin@mail.com';
    composant.password = 'admin123';
    composant.onSubmit();
    expect(composant.errorMessage).toBe('');
  });
});

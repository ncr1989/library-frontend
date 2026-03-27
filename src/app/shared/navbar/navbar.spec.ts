import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Navbar } from './navbar';
import { AuthService } from '../../core/services/auth';

describe('Navbar', () => {
  let composant: Navbar;
  let fixture: ComponentFixture<Navbar>;
  let roleValue = 'ADMIN';
  let logoutCalled = false;

  const authServiceMock = {
    getNom: () => 'Admin',
    getRole: () => roleValue,
    isAdmin: () => roleValue === 'ADMIN',
    logout: () => { logoutCalled = true; },
    isLoggedIn: () => true
  };

  beforeEach(async () => {
    roleValue = 'ADMIN';
    logoutCalled = false;

    await TestBed.configureTestingModule({
      imports: [Navbar],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: authServiceMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(Navbar);
    composant = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('devrait afficher le nom de l\'utilisateur connecté', () => {
    expect(composant.nom).toBe('Admin');
  });

  it('devrait retourner "Bibliothécaire" pour le rôle ADMIN', () => {
    expect(composant.roleLabel).toBe('Bibliothécaire');
  });

  it('devrait retourner "Étudiant" pour le rôle ETUDIANT', () => {
    roleValue = 'ETUDIANT';
    expect(composant.roleLabel).toBe('Étudiant');
  });

  it('devrait retourner "Enseignant" pour le rôle ENSEIGNANT', () => {
    roleValue = 'ENSEIGNANT';
    expect(composant.roleLabel).toBe('Enseignant');
  });

  it('devrait retourner bg-danger pour le badge administrateur', () => {
    expect(composant.roleBadgeClass).toBe('bg-danger');
  });

  it('devrait appeler authService.logout lors de la déconnexion', () => {
    composant.logout();
    expect(logoutCalled).toBe(true);
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { Navbar } from './navbar';
import { AuthService } from '../../core/services/auth';

describe('Navbar', () => {
  let composant: Navbar;
  let fixture: ComponentFixture<Navbar>;
  let authService: jasmine.SpyObj<AuthService>;

  beforeEach(async () => {
    authService = jasmine.createSpyObj('AuthService', ['getNom', 'getRole', 'isAdmin', 'logout', 'isLoggedIn']);
    authService.getNom.and.returnValue('Admin');
    authService.getRole.and.returnValue('ADMIN');
    authService.isAdmin.and.returnValue(true);

    await TestBed.configureTestingModule({
      imports: [Navbar, RouterTestingModule],
      providers: [{ provide: AuthService, useValue: authService }]
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
    authService.getRole.and.returnValue('ETUDIANT');
    expect(composant.roleLabel).toBe('Étudiant');
  });

  it('devrait retourner bg-danger pour le badge administrateur', () => {
    expect(composant.roleBadgeClass).toBe('bg-danger');
  });

  it('devrait appeler authService.logout lors de la déconnexion', () => {
    composant.logout();
    expect(authService.logout).toHaveBeenCalled();
  });
});
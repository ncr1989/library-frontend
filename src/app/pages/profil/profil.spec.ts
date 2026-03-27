import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { Profil } from './profil';
import { AuthService } from '../../core/services/auth';

const mockUser = {
  id: 3, nom: 'Dupont', prenom: 'Jean',
  email: 'jean@mail.com', telephone: '0633333333', caution: 12.5
};

const authServiceMock = {
  getUserId: () => '3',
  getRole: () => 'ETUDIANT',
  getNom: () => 'Jean',
  isAdmin: () => false,
  isLoggedIn: () => true,
  getCaution: () => 12.5
};

describe('Profil', () => {
  let composant: Profil;
  let fixture: ComponentFixture<Profil>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Profil],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: AuthService, useValue: authServiceMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(Profil);
    composant = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    fixture.autoDetectChanges();
    httpMock.expectOne('http://localhost:8080/api/etudiants/3').flush(mockUser);
  });

  afterEach(() => httpMock.verify());

  it('devrait charger le profil et pré-remplir le formulaire', () => {
    expect(composant.form.nom).toBe('Dupont');
    expect(composant.form.prenom).toBe('Jean');
  });

  it('devrait retourner "Étudiant" pour le label du rôle ETUDIANT', () => {
    expect(composant.roleLabel).toBe('Étudiant');
  });

  it('devrait retourner true pour cautionSuffisante quand la caution est positive', () => {
    expect(composant.cautionSuffisante).toBe(true);
  });

  it('devrait retourner false pour cautionSuffisante quand la caution est à zéro', () => {
    composant.user = { caution: 0 };
    expect(composant.cautionSuffisante).toBe(false);
  });

  it('devrait calculer le pourcentage de caution correctement (10€ sur 20€ max = 50%)', () => {
    composant.user = { caution: 10 };
    expect(composant.cautionPercent).toBe(50);
  });

  it('devrait afficher un message de succès après la sauvegarde', () => {
    composant.saveProfile();
    httpMock.expectOne('http://localhost:8080/api/etudiants/3').flush(mockUser);
    httpMock.expectOne('http://localhost:8080/api/etudiants/3').flush(mockUser);
    expect(composant.successMessage).toBe('Profil mis à jour avec succès.');
  });
});
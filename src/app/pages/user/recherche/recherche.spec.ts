import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { Recherche } from './recherche';
import { AuthService } from '../../../core/services/auth';

const mockOuvrages = [
  { id: 1, titre: 'Les Misérables', caution: 5, anneePublication: '1862-01-01', isbn: 123, auteurs: [{ nom: 'Hugo', prenom: 'Victor' }], themes: [{ nomTheme: 'Littérature française' }], exemplaires: [{ id: 1, disponible: true }] },
  { id: 2, titre: 'Le Petit Prince', caution: 3, anneePublication: '1943-04-06', isbn: 456, auteurs: [{ nom: 'Exupéry', prenom: 'Antoine' }], themes: [{ nomTheme: 'Jeunesse' }], exemplaires: [{ id: 2, disponible: false }] },
  { id: 3, titre: 'Science & Vie', caution: 2, anneePublication: '2024-01-01', numeroVolume: 1260, auteurs: [], themes: [], exemplaires: [] }
];

describe('Recherche', () => {
  let composant: Recherche;
  let fixture: ComponentFixture<Recherche>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    const authService = jasmine.createSpyObj('AuthService', ['getUserId', 'getNom', 'getRole', 'isAdmin', 'isLoggedIn']);
    authService.getUserId.and.returnValue('3');
    authService.getRole.and.returnValue('ETUDIANT');
    authService.isAdmin.and.returnValue(false);

    await TestBed.configureTestingModule({
      imports: [Recherche, HttpClientTestingModule, RouterTestingModule],
      providers: [{ provide: AuthService, useValue: authService }]
    }).compileComponents();

    fixture = TestBed.createComponent(Recherche);
    composant = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
    httpMock.expectOne('http://localhost:8080/api/utilisateurs/3').flush({ id: 3, caution: 10 });
    httpMock.expectOne('http://localhost:8080/api/ouvrages').flush(mockOuvrages);
    fixture.detectChanges();
  });

  afterEach(() => httpMock.verify());

  it('devrait charger les ouvrages et la caution au démarrage', () => {
    expect(composant.ouvrages.length).toBe(3);
    expect(composant.userCaution).toBe(10);
  });

  it('devrait filtrer par titre en mode simple', () => {
    composant.searchMode = 'simple';
    composant.searchTitre = 'misérables';
    composant.search();
    expect(composant.filteredOuvrages.length).toBe(1);
  });

  it('devrait filtrer par auteur en mode avancé', () => {
    composant.searchMode = 'avancee';
    composant.searchAuteur = 'Hugo';
    composant.search();
    expect(composant.filteredOuvrages.length).toBe(1);
  });

  it('devrait retourner false pour hasDisponibleExemplaire() quand tout est emprunté', () => {
    expect(composant.hasDisponibleExemplaire(mockOuvrages[1])).toBe(false);
  });

  it('devrait retourner false pour canAfford() quand la caution est insuffisante', () => {
    composant.userCaution = 1;
    expect(composant.canAfford({ caution: 5 })).toBe(false);
  });

  it('devrait afficher une erreur si aucun exemplaire n\'est disponible', () => {
    composant.selectedExemplaire = null;
    composant.confirmerEmprunt();
    expect(composant.errorMessage).toBe('Aucun exemplaire disponible.');
  });

  it('devrait réinitialiser la recherche et restaurer tous les ouvrages', () => {
    composant.searchTitre = 'test';
    composant.filteredOuvrages = [];
    composant.resetSearch();
    expect(composant.searchTitre).toBe('');
    expect(composant.filteredOuvrages.length).toBe(3);
  });
});
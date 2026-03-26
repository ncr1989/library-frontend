import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { Emprunts } from './emprunts';
import { AuthService } from '../../../core/services/auth';

const mockEmprunts = [
  { id: 1, utilisateur: { nom: 'Dupont', prenom: 'Jean' }, exemplaire: { ouvrage: { titre: 'Les Misérables' } }, dateDebut: '2024-01-01', dateFinPrevue: '2024-01-15', dateRetourEffective: '2024-01-14', enRetard: false, montantAmende: 0 },
  { id: 2, utilisateur: { nom: 'Martin', prenom: 'Alice' }, exemplaire: { ouvrage: { titre: 'Le Petit Prince' } }, dateDebut: '2024-01-05', dateFinPrevue: '2024-01-10', dateRetourEffective: null, enRetard: true, montantAmende: 15.5 },
  { id: 3, utilisateur: { nom: 'Bernard', prenom: 'Paul' }, exemplaire: { ouvrage: { titre: 'L\'Étranger' } }, dateDebut: '2024-01-08', dateFinPrevue: '2099-01-22', dateRetourEffective: null, enRetard: false, montantAmende: 0 }
];

describe('Emprunts (admin)', () => {
  let composant: Emprunts;
  let fixture: ComponentFixture<Emprunts>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    const authService = jasmine.createSpyObj('AuthService', ['isAdmin', 'logout', 'getNom', 'getRole', 'isLoggedIn', 'getUserId']);
    authService.isAdmin.and.returnValue(true);
    authService.getNom.and.returnValue('Admin');
    authService.getRole.and.returnValue('ADMIN');

    await TestBed.configureTestingModule({
      imports: [Emprunts, HttpClientTestingModule, RouterTestingModule],
      providers: [{ provide: AuthService, useValue: authService }]
    }).compileComponents();

    fixture = TestBed.createComponent(Emprunts);
    composant = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
    httpMock.expectOne('http://localhost:8080/api/emprunts').flush(mockEmprunts);
    fixture.detectChanges();
  });

  afterEach(() => httpMock.verify());

  it('devrait charger les emprunts au démarrage', () => {
    expect(composant.emprunts.length).toBe(3);
  });

  it('devrait filtrer uniquement les emprunts en retard', () => {
    composant.selectedStatut = 'RETARD';
    composant.applyFilter();
    expect(composant.filtered.length).toBe(1);
    expect(composant.filtered[0].id).toBe(2);
  });

  it('devrait filtrer uniquement les emprunts retournés', () => {
    composant.selectedStatut = 'RETOURNE';
    composant.applyFilter();
    expect(composant.filtered.length).toBe(1);
    expect(composant.filtered[0].id).toBe(1);
  });

  it('devrait retourner "—" quand le titre de l\'ouvrage est absent', () => {
    expect(composant.getTitre({ exemplaire: null })).toBe('—');
  });

  it('devrait compter correctement les emprunts en retard', () => {
    expect(composant.retardsCount).toBe(1);
  });

  it('devrait ouvrir la modale de retour avec l\'emprunt sélectionné', () => {
    composant.openRetour(mockEmprunts[1]);
    expect(composant.showRetourModal).toBe(true);
    expect(composant.selectedEmprunt).toEqual(mockEmprunts[1]);
  });

  it('devrait appeler POST /retour et recharger la liste', () => {
    composant.selectedEmprunt = mockEmprunts[1];
    composant.confirmerRetour();
    const req = httpMock.expectOne('http://localhost:8080/api/emprunts/2/retour');
    req.flush({ ...mockEmprunts[1], dateRetourEffective: '2024-01-20', montantAmende: 0 });
    httpMock.expectOne('http://localhost:8080/api/emprunts').flush(mockEmprunts);
    expect(composant.successMessage).toContain('Retour enregistré');
  });
});
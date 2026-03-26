import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { MesEmprunts } from './mes-emprunts';
import { AuthService } from '../../../core/services/auth';

const mockEmprunts = [
  { id: 1, enRetard: false, dateRetourEffective: '2024-01-14', montantAmende: 0, exemplaire: { ouvrage: { titre: 'Les Misérables' } } },
  { id: 2, enRetard: true, dateRetourEffective: null, montantAmende: 15.5, exemplaire: { ouvrage: { titre: 'Le Petit Prince' } } },
  { id: 3, enRetard: false, dateRetourEffective: null, montantAmende: 0, exemplaire: { ouvrage: { titre: 'L\'Étranger' } } }
];

describe('MesEmprunts', () => {
  let composant: MesEmprunts;
  let fixture: ComponentFixture<MesEmprunts>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    const authService = jasmine.createSpyObj('AuthService', ['getUserId', 'getNom', 'getRole', 'isAdmin', 'isLoggedIn']);
    authService.getUserId.and.returnValue('3');
    authService.getRole.and.returnValue('ETUDIANT');
    authService.isAdmin.and.returnValue(false);

    await TestBed.configureTestingModule({
      imports: [MesEmprunts, HttpClientTestingModule, RouterTestingModule],
      providers: [{ provide: AuthService, useValue: authService }]
    }).compileComponents();

    fixture = TestBed.createComponent(MesEmprunts);
    composant = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
    httpMock.expectOne('http://localhost:8080/api/utilisateurs/3').flush({ id: 3, caution: 8.5 });
    httpMock.expectOne('http://localhost:8080/api/emprunts/utilisateur/3').flush(mockEmprunts);
    fixture.detectChanges();
  });

  afterEach(() => httpMock.verify());

  it('devrait charger les emprunts et la caution au démarrage', () => {
    expect(composant.emprunts.length).toBe(3);
    expect(composant.userCaution).toBe(8.5);
  });

  it('devrait retourner le titre depuis la structure imbriquée', () => {
    expect(composant.getTitre(mockEmprunts[0])).toBe('Les Misérables');
  });

  it('devrait retourner "—" quand l\'exemplaire est absent', () => {
    expect(composant.getTitre({ exemplaire: null })).toBe('—');
  });

  it('devrait compter 2 emprunts en cours (non retournés)', () => {
    expect(composant.empruntsEnCours).toBe(2);
  });

  it('devrait compter 1 emprunt en retard', () => {
    expect(composant.empruntsEnRetard).toBe(1);
  });

  it('devrait calculer les amendes pendantes sur les emprunts non retournés', () => {
    expect(composant.amendesPendantes).toBe(15.5);
  });
});
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../core/services/auth';
import { Navbar } from '../../../shared/navbar/navbar';

@Component({
  selector: 'app-ouvrages',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, Navbar],
  templateUrl: './ouvrages.html',
  styleUrl: './ouvrages.css'
})
export class Ouvrages implements OnInit {

  private apiUrl = 'http://localhost:8080/api';

  ouvrages: any[] = [];
  filtered: any[] = [];
  categories: any[] = [];
  loading = false;
  successMessage = '';
  errorMessage = '';

  searchTerm = '';
  selectedType = '';

  auteurs: any[] = [];                
selectedAuteurIds: number[] = [];   
newAuteurNom = '';
newAuteurPrenom = '';
showNewAuteur = false;
  showModal = false;
  isEditing = false;
  form: any = {
    id: null, titre: '', caution: 0, anneePublication: '',
    type: 'LIVRE', isbn: '', numeroVolume: '', dateDeParution: '',
  };

  
  showDeleteModal = false;
  ouvrageToDelete: any = null;

  
  showExemplairesPanel = false;
  selectedOuvrage: any = null;
  showAddExemplaireForm = false;
  exemplaireForm: any = {
    codeBarre: '', niveau: '', numeroTravee: '', categorieId: null
  };
  newCategorieNom = '';
  showNewCategorie = false;
  exemplaireLoading = false;

  
  showDeleteExemplaireModal = false;
  exemplaireToDelete: any = null;

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadOuvrages();
    this.loadCategories();
    this.loadAuteurs();
  }

  loadAuteurs() {
  this.http.get<any[]>(`${this.apiUrl}/auteurs`).subscribe({
    next: (data) => this.auteurs = data,
    error: () => {}
  });
}

isAuteurSelected(id: number): boolean {
  return this.selectedAuteurIds.includes(id);
}

toggleAuteur(id: number) {
  if (this.isAuteurSelected(id)) {
    this.selectedAuteurIds = this.selectedAuteurIds.filter(a => a !== id);
  } else {
    this.selectedAuteurIds.push(id);
  }
}

createAndSelectAuteur() {
  if (!this.newAuteurNom.trim()) return;
  this.http.post<any>(`${this.apiUrl}/auteurs`, {
    nom: this.newAuteurNom,
    prenom: this.newAuteurPrenom
  }).subscribe({
    next: (auteur) => {
      this.auteurs.push(auteur);
      this.selectedAuteurIds.push(auteur.id);
      this.newAuteurNom = '';
      this.newAuteurPrenom = '';
      this.showNewAuteur = false;
    },
    error: () => this.errorMessage = 'Erreur lors de la création de l\'auteur'
  });
}

  loadOuvrages() {
    this.loading = true;
    this.http.get<any[]>(`${this.apiUrl}/ouvrages`).subscribe({
      next: (data) => {
        this.ouvrages = data;
        this.filtered = data;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.errorMessage = 'Erreur de chargement.';
        this.loading = false;
      }
    });
  }

  loadCategories() {
    this.http.get<any[]>(`${this.apiUrl}/categories`).subscribe({
      next: (data) => this.categories = data,
      error: () => {}
    });
  }

  applyFilter() {
    this.filtered = this.ouvrages.filter(o => {
      const matchSearch = !this.searchTerm ||
        o.titre?.toLowerCase().includes(this.searchTerm.toLowerCase());
      const matchType = !this.selectedType || this.getType(o) === this.selectedType;
      return matchSearch && matchType;
    });
  }

  getType(o: any): string {
    if (o.isbn !== undefined) return 'LIVRE';
    if (o.numeroVolume !== undefined) return 'REVUE';
    return 'OUVRAGE';
  }

  getTypeLabel(o: any): string {
    switch (this.getType(o)) {
      case 'LIVRE': return 'Livre';
      case 'REVUE': return 'Revue';
      default: return 'Ouvrage';
    }
  }

  getTypeBadge(o: any): string {
    switch (this.getType(o)) {
      case 'LIVRE': return 'bg-primary';
      case 'REVUE': return 'bg-warning text-dark';
      default: return 'bg-secondary';
    }
  }

  getDisponibles(o: any): number {
    return o.exemplaires?.filter((e: any) => e.disponible).length || 0;
  }

  getTotalExemplaires(o: any): number {
    return o.exemplaires?.length || 0;
  }

  

  openAdd() {
  this.isEditing = false;
  this.selectedAuteurIds = [];
  this.showNewAuteur = false;
  this.form = {
    id: null, titre: '', caution: 0, anneePublication: '',
    type: 'LIVRE', isbn: '', numeroVolume: '', dateDeParution: ''
  };
  this.showModal = true;
}

  openEdit(o: any) {
  this.isEditing = true;
  this.selectedAuteurIds = o.auteurs?.map((a: any) => a.id) || [];
  this.showNewAuteur = false;
  this.form = { ...o, type: this.getType(o) };
  this.showModal = true;
}

  save() {
  this.successMessage = '';
  this.errorMessage = '';
  const endpoint = this.form.type === 'LIVRE' ? 'livres' : 'revues';

 
  const payload = {
    ...this.form,
    auteurs: this.selectedAuteurIds.map(id => ({ id }))
  };

  if (this.isEditing) {
    this.http.put(`${this.apiUrl}/${endpoint}/${this.form.id}`, payload).subscribe({
      next: () => {
        this.showModal = false;
        this.successMessage = 'Ouvrage modifié.';
        this.loadOuvrages();
      },
      error: () => this.errorMessage = 'Erreur lors de la modification.'
    });
  } else {
    this.http.post(`${this.apiUrl}/${endpoint}`, payload).subscribe({
      next: () => {
        this.showModal = false;
        this.successMessage = 'Ouvrage créé.';
        this.loadOuvrages();
      },
      error: (err) => this.errorMessage = 'Erreur lors de la création: ' + err.message
    });
  }
}

  
  openDelete(o: any) {
    this.ouvrageToDelete = o;
    this.showDeleteModal = true;
  }

  confirmerDelete() {
    if (!this.ouvrageToDelete) return;
    this.successMessage = '';
    this.errorMessage = '';
    const endpoint = this.getType(this.ouvrageToDelete) === 'LIVRE' ? 'livres' : 'revues';
    this.http.delete(`${this.apiUrl}/${endpoint}/${this.ouvrageToDelete.id}`).subscribe({
      next: () => {
        this.successMessage = 'Ouvrage supprimé.';
        this.showDeleteModal = false;
        this.ouvrageToDelete = null;
        if (this.selectedOuvrage?.id === this.ouvrageToDelete?.id) {
          this.closeExemplaires();
        }
        this.loadOuvrages();
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Erreur lors de la suppression.';
        this.showDeleteModal = false;
        this.cdr.detectChanges();
      }
    });
  }

  

  openExemplaires(o: any) {
    this.selectedOuvrage = o;
    this.showExemplairesPanel = true;
    this.showAddExemplaireForm = false;
    this.exemplaireForm = { codeBarre: '', niveau: '', numeroTravee: '', categorieId: null };
  }

  closeExemplaires() {
    this.showExemplairesPanel = false;
    this.selectedOuvrage = null;
    this.showAddExemplaireForm = false;
  }

  addExemplaire() {
    if (!this.exemplaireForm.codeBarre || !this.exemplaireForm.niveau
        || !this.exemplaireForm.numeroTravee || !this.exemplaireForm.categorieId) {
      this.errorMessage = 'Veuillez remplir tous les champs de l\'exemplaire.';
      return;
    }

    this.exemplaireLoading = true;
    this.errorMessage = '';

    const emplacement = {
      niveau: parseInt(this.exemplaireForm.niveau),
      numeroTravee: parseInt(this.exemplaireForm.numeroTravee),
      categorie: { id: this.exemplaireForm.categorieId }
    };

    this.http.post<any>(`${this.apiUrl}/emplacements`, emplacement).subscribe({
      next: (emp) => {
        const exemplaire = {
          codeBarre: parseInt(this.exemplaireForm.codeBarre),
          disponible: true,
          ouvrage: { id: this.selectedOuvrage.id },
          emplacement: { id: emp.id }
        };

        this.http.post<any>(`${this.apiUrl}/exemplaires`, exemplaire).subscribe({
          next: () => {
            this.exemplaireLoading = false;
            this.showAddExemplaireForm = false;
            this.successMessage = 'Exemplaire ajouté.';
            this.loadOuvrages();
            setTimeout(() => {
              this.selectedOuvrage = this.ouvrages.find(o => o.id === this.selectedOuvrage?.id);
            }, 500);
          },
          error: (err) => {
            this.exemplaireLoading = false;
            this.errorMessage = err.error?.message || 'Erreur lors de l\'ajout de l\'exemplaire.';
          }
        });
      },
      error: () => {
        this.exemplaireLoading = false;
        this.errorMessage = 'Erreur lors de la création de l\'emplacement.';
      }
    });
  }

  
  openDeleteExemplaire(ex: any) {
    this.exemplaireToDelete = ex;
    this.showDeleteExemplaireModal = true;
  }

  confirmerDeleteExemplaire() {
    if (!this.exemplaireToDelete) return;
    this.http.delete(`${this.apiUrl}/exemplaires/${this.exemplaireToDelete.id}`).subscribe({
      next: () => {
        this.successMessage = 'Exemplaire supprimé.';
        this.showDeleteExemplaireModal = false;
        this.exemplaireToDelete = null;
        this.loadOuvrages();
        setTimeout(() => {
          this.selectedOuvrage = this.ouvrages.find(o => o.id === this.selectedOuvrage?.id);
        }, 500);
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Erreur lors de la suppression.';
        this.showDeleteExemplaireModal = false;
        this.cdr.detectChanges();
      }
    });
  }

  createAndSelectCategorie() {
    if (!this.newCategorieNom.trim()) return;
    this.http.post<any>(`${this.apiUrl}/categories`, { nom: this.newCategorieNom }).subscribe({
      next: (cat) => {
        this.categories.push(cat);
        this.exemplaireForm.categorieId = cat.id;
        this.newCategorieNom = '';
        this.showNewCategorie = false;
      },
      error: () => this.errorMessage = 'Erreur lors de la création de la catégorie'
    });
  }

  getCategorieNom(ex: any): string {
    return ex.emplacement?.categorie?.nom || '—';
  }

  getEmplacementLabel(ex: any): string {
    if (!ex.emplacement) return '—';
    return `Niveau ${ex.emplacement.niveau}, Travée ${ex.emplacement.numeroTravee}`;
  }

  logout() { this.authService.logout(); }
}
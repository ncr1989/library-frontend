import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../core/services/auth';
import { Navbar } from '../../../shared/navbar/navbar';
import { ChangeDetectorRef } from '@angular/core';

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
  loading = false;
  successMessage = '';
  errorMessage = '';

  searchTerm = '';
  selectedType = '';

  showModal = false;
  isEditing = false;
  

  form: any = {
    id: null,
    titre: '',
    caution: 0,
    anneePublication: '',
    type: 'LIVRE',
    isbn: '',
    numeroVolume: '',
    dateDeParution: ''
  };

  constructor(private http: HttpClient, private authService: AuthService,private cdr: ChangeDetectorRef) {}

  ngOnInit() { this.loadOuvrages(); }

  loadOuvrages() {
  this.loading = true;

  this.http.get<any[]>(`${this.apiUrl}/ouvrages`).subscribe({
    next: (data) => {
      console.log('OUVRAGES:', data);

      this.ouvrages = data;

      // 🔥 IMPORTANT: initialize filtered directly
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

  openAdd() {
    this.isEditing = false;
    this.form = { id: null, titre: '', caution: 0, anneePublication: '', type: 'LIVRE', isbn: '', numeroVolume: '', dateDeParution: '' };
    this.showModal = true;
  }

  openEdit(o: any) {
    this.isEditing = true;
    this.form = { ...o, type: this.getType(o) };
    this.showModal = true;
  }

  save() {
  const endpoint = this.form.type === 'LIVRE' ? 'livres' : 'revues';

  if (this.isEditing) {
    this.http.put(`${this.apiUrl}/${endpoint}/${this.form.id}`, this.form).subscribe({
      next: () => {
        this.showModal = false;        
        this.successMessage = 'Ouvrage modifié.';
        this.loadOuvrages();
      },
      error: () => {
        this.errorMessage = 'Erreur lors de la modification.';
      }
    });
  } else {
    this.http.post(`${this.apiUrl}/${endpoint}`, this.form).subscribe({
      next: () => {
        this.showModal = false;        
        this.successMessage = 'Ouvrage créé.';
        this.loadOuvrages();
      },
      error: (err) => {
        this.errorMessage = 'Erreur lors de la création: ' + err.message;
      }
    });
  }
}

  delete(o: any) {
    if (!confirm(`Supprimer "${o.titre}" ?`)) return;
    const endpoint = this.getType(o) === 'LIVRE' ? 'livres' : 'revues';
    this.http.delete(`${this.apiUrl}/${endpoint}/${o.id}`).subscribe({
      next: () => { this.successMessage = 'Ouvrage supprimé.'; this.loadOuvrages(); },
      error: () => this.errorMessage = 'Erreur lors de la suppression.'
    });
  }

  logout() { this.authService.logout(); }
}
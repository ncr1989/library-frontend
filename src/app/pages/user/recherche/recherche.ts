import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../core/services/auth';
import { Navbar } from '../../../shared/navbar/navbar';

@Component({
  selector: 'app-recherche',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, Navbar],
  templateUrl: './recherche.html',
  styleUrl: './recherche.css'
})
export class Recherche implements OnInit {

  private apiUrl = 'http://localhost:8080/api';

  searchMode: 'simple' | 'avancee' = 'simple';
  searchTitre = '';
  searchAuteur = '';
  searchAnnee = '';
  searchTheme = '';           // selected theme value
  availableThemes: string[] = []; // all unique themes from API

  ouvrages: any[] = [];
  filteredOuvrages: any[] = [];
  loading = false;

  userCaution = 0;

  // Emprunt modal
  showEmpruntModal = false;
  selectedOuvrage: any = null;
  selectedExemplaire: any = null;
  empruntForm = {
    dateDebut: new Date().toISOString().split('T')[0],
    dateFinPrevue: ''
  };
  empruntLoading = false;
  empruntSuccess = false;
  successMessage = '';
  errorMessage = '';
  cautionError = '';

  constructor(private http: HttpClient, private authService: AuthService) {}

  ngOnInit() {
    this.loadCurrentUser();
    this.loadAllOuvrages();
  }

  loadCurrentUser() {
    const userId = this.authService.getUserId();
    this.http.get<any>(`${this.apiUrl}/utilisateurs/${userId}`).subscribe({
      next: (user) => { this.userCaution = user.caution || 0; },
      error: () => {}
    });
  }

  loadAllOuvrages() {
    this.loading = true;
    this.http.get<any[]>(`${this.apiUrl}/ouvrages`).subscribe({
      next: (data) => {
        this.ouvrages = data;
        this.filteredOuvrages = data;
        // Extract all unique themes for the select
        const themes = new Set<string>();
        data.forEach(o => {
          o.themes?.forEach((t: any) => {
            if (t.nomTheme) themes.add(t.nomTheme);
          });
        });
        this.availableThemes = Array.from(themes).sort();
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }

  search() {
    this.filteredOuvrages = this.ouvrages.filter(o => {
      if (this.searchMode === 'simple') {
        return !this.searchTitre ||
          o.titre?.toLowerCase().includes(this.searchTitre.toLowerCase());
      } else {
        const matchAuteur = !this.searchAuteur ||
          o.auteurs?.some((a: any) =>
            `${a.nom} ${a.prenom}`.toLowerCase().includes(this.searchAuteur.toLowerCase())
          );
        const matchAnnee = !this.searchAnnee ||
          o.anneePublication?.startsWith(this.searchAnnee);
        const matchTheme = !this.searchTheme ||
          o.themes?.some((t: any) => t.nomTheme === this.searchTheme);
        return matchAuteur && matchAnnee && matchTheme;
      }
    });
  }

  resetSearch() {
    this.searchTitre = '';
    this.searchAuteur = '';
    this.searchAnnee = '';
    this.searchTheme = '';
    this.filteredOuvrages = this.ouvrages;
  }

  getType(o: any): string {
    if (o.isbn !== undefined) return 'Livre';
    if (o.numeroVolume !== undefined) return 'Revue';
    return 'Ouvrage';
  }

  getTypeBadge(o: any): string {
    if (o.isbn !== undefined) return 'bg-primary';
    if (o.numeroVolume !== undefined) return 'bg-warning text-dark';
    return 'bg-secondary';
  }

  getAuteurs(o: any): string {
    return o.auteurs?.map((a: any) => `${a.prenom} ${a.nom}`).join(', ') || '—';
  }

  getThemes(o: any): string {
    return o.themes?.map((t: any) => t.nomTheme).join(', ') || '—';
  }

  hasDisponibleExemplaire(o: any): boolean {
    return o.exemplaires?.some((e: any) => e.disponible) || false;
  }

  canAfford(o: any): boolean {
    return this.userCaution >= (o.caution || 0);
  }

  openEmprunt(ouvrage: any) {
    this.selectedOuvrage = ouvrage;
    this.selectedExemplaire = ouvrage.exemplaires?.find((e: any) => e.disponible);
    this.empruntForm.dateDebut = new Date().toISOString().split('T')[0];
    const returnDate = new Date();
    returnDate.setDate(returnDate.getDate() + 14);
    this.empruntForm.dateFinPrevue = returnDate.toISOString().split('T')[0];
    this.successMessage = '';
    this.errorMessage = '';
    this.cautionError = '';
    this.empruntSuccess = false;
    this.empruntLoading = false;

    if (!this.canAfford(ouvrage)) {
      this.cautionError = `Solde insuffisant. Votre caution : ${this.userCaution.toFixed(2)}€ — Caution requise : ${ouvrage.caution.toFixed(2)}€`;
    }

    this.showEmpruntModal = true;
  }

  closeModal() {
    this.showEmpruntModal = false;
    this.empruntSuccess = false;
    this.successMessage = '';
    this.errorMessage = '';
    this.cautionError = '';
  }

  confirmerEmprunt() {
    if (!this.selectedExemplaire) {
      this.errorMessage = 'Aucun exemplaire disponible.';
      return;
    }
    if (!this.canAfford(this.selectedOuvrage)) {
      this.errorMessage = `Caution insuffisante. Solde : ${this.userCaution.toFixed(2)}€ — Requis : ${this.selectedOuvrage.caution.toFixed(2)}€`;
      return;
    }

    this.empruntLoading = true;
    this.errorMessage = '';

    const userId = this.authService.getUserId();
    const emprunt = {
      dateDebut: this.empruntForm.dateDebut,
      dateFinPrevue: this.empruntForm.dateFinPrevue,
      utilisateur: { id: parseInt(userId) },
      exemplaire: { id: this.selectedExemplaire.id }
    };

    this.http.post(`${this.apiUrl}/emprunts`, emprunt).subscribe({
      next: () => {
        this.empruntLoading = false;
        this.empruntSuccess = true;
        this.successMessage = `"${this.selectedOuvrage.titre}" emprunté avec succès !`;
        // Mark exemplaire unavailable locally
        this.selectedExemplaire.disponible = false;
        // Auto close after 1.5s
        setTimeout(() => this.closeModal(), 1500);
      },
      error: (err) => {
        this.empruntLoading = false;
        if (err.status === 400) {
          this.errorMessage = err.error?.detail || err.error?.message || 'Caution insuffisante.';
        } else {
          this.errorMessage = 'Erreur lors de l\'emprunt. Réessayez.';
        }
      }
    });
  }
}
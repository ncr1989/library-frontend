import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../core/services/auth';
import { Navbar } from '../../../shared/navbar/navbar';

@Component({
  selector: 'app-emprunts',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, Navbar],
  templateUrl: './emprunts.html',
  styleUrl: './emprunts.css'
})
export class Emprunts implements OnInit {

  private apiUrl = 'http://localhost:8080/api';

  emprunts: any[] = [];
  filtered: any[] = [];
  loading = false;
  selectedStatut = '';
  successMessage = '';
  errorMessage = '';

  
  showRetourModal = false;
  selectedEmprunt: any = null;
  retourLoading = false;

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() { this.loadEmprunts(); }

  loadEmprunts() {
    this.loading = true;
    this.http.get<any[]>(`${this.apiUrl}/emprunts`).subscribe({
      next: (data) => {
        this.emprunts = data;
        this.applyFilter();
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
    this.filtered = this.emprunts.filter(e => {
      if (!this.selectedStatut) return true;
      if (this.selectedStatut === 'RETARD') return e.enRetard;
      if (this.selectedStatut === 'RETOURNE') return !!e.dateRetourEffective;
      if (this.selectedStatut === 'ENCOURS') return !e.dateRetourEffective && !e.enRetard;
      return true;
    });
  }

  getStatutLabel(e: any): string {
    if (e.enRetard) return 'En retard';
    if (e.dateRetourEffective) return 'Retourné';
    return 'En cours';
  }

  getStatutBadge(e: any): string {
    if (e.enRetard) return 'bg-danger';
    if (e.dateRetourEffective) return 'bg-success';
    return 'bg-primary';
  }

  getTitre(e: any): string {
    return e?.exemplaire?.ouvrage?.titre || '—';
  }


  openRetour(e: any) {
    this.selectedEmprunt = e;
    this.showRetourModal = true;
    this.errorMessage = '';
  }

  closeRetourModal() {
    this.showRetourModal = false;
    this.selectedEmprunt = null;
  }

  confirmerRetour() {
    if (!this.selectedEmprunt) return;
    this.retourLoading = true;

    this.http.post<any>(
      `${this.apiUrl}/emprunts/${this.selectedEmprunt.id}/retour`, {}
    ).subscribe({
      next: (updated) => {
        this.retourLoading = false;
        this.showRetourModal = false;

        
        if (updated.montantAmende > 0) {
          this.successMessage = `Retour enregistré. Amende appliquée : ${updated.montantAmende.toFixed(2)}€ déduite de la caution de ${updated.utilisateur?.nom} ${updated.utilisateur?.prenom}.`;
        } else {
          this.successMessage = `Retour enregistré pour "${this.getTitre(this.selectedEmprunt)}".`;
        }

        this.loadEmprunts();
      },
      error: (err) => {
        this.retourLoading = false;
        this.errorMessage = err.error?.message || 'Erreur lors de l\'enregistrement du retour.';
        this.showRetourModal = false;
        this.cdr.detectChanges();
      }
    });
  }

  isLate(e: any): boolean {
    if (e.dateRetourEffective || !e.dateFinPrevue) return false;
    return new Date() > new Date(e.dateFinPrevue);
  }

  get retardsCount(): number {
    return this.emprunts.filter(e => e.enRetard).length;
  }

  get enCoursCount(): number {
    return this.emprunts.filter(e => !e.dateRetourEffective).length;
  }

  logout() { this.authService.logout(); }
}
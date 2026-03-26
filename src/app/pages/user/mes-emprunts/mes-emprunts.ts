import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../core/services/auth';
import { Navbar } from '../../../shared/navbar/navbar';
import { ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-mes-emprunts',
  standalone: true,
  imports: [CommonModule, RouterModule, Navbar],
  templateUrl: './mes-emprunts.html',
  styleUrl: './mes-emprunts.css'
})
export class MesEmprunts implements OnInit {

  emprunts: any[] = [];
  loading = false;
  errorMessage = '';
  userCaution = 0;

  private apiUrl = 'http://localhost:8080/api';

  constructor(private http: HttpClient, private authService: AuthService,private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.loadCurrentUser();
    this.loadEmprunts();
  }

  loadCurrentUser() {
    const userId = this.authService.getUserId();
    this.http.get<any>(`${this.apiUrl}/utilisateurs/${userId}`).subscribe({
      next: (user) => { this.userCaution = user.caution || 0; },
      error: () => {}
    });
  }

  loadEmprunts() {
    this.loading = true;
    const userId = this.authService.getUserId();
    this.http.get<any[]>(`${this.apiUrl}/emprunts/utilisateur/${userId}`).subscribe({
      next: (data) => {
        this.emprunts = data;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.errorMessage = 'Erreur lors du chargement de vos emprunts.';
        this.loading = false;
      }
    });
  }

  // Bug fix: safely navigate the exemplaire -> ouvrage -> titre chain
  getTitre(e: any): string {
    if (e?.exemplaire?.ouvrage?.titre) return e.exemplaire.ouvrage.titre;
    if (e?.exemplaire?.titre) return e.exemplaire.titre;
    return '—';
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

  get empruntsEnCours(): number {
    return this.emprunts.filter(e => !e.dateRetourEffective).length;
  }

  get empruntsEnRetard(): number {
    return this.emprunts.filter(e => e.enRetard).length;
  }

  get amendesPendantes(): number {
    return this.emprunts
      .filter(e => e.enRetard && !e.dateRetourEffective)
      .reduce((sum, e) => sum + (e.montantAmende || 0), 0);
  }
}
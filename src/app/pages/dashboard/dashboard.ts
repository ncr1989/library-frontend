import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../core/services/auth';
import { Navbar } from '../../shared/navbar/navbar';
import { ChangeDetectorRef } from '@angular/core';


@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, Navbar],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard implements OnInit {

  nom = '';
  role = '';
  isAdmin = false;

  stats = {
    livres: 0,
    emprunts: 0,
    utilisateurs: 0,
    retards: 0
  };

  recentEmprunts: any[] = [];
  loading = true;

  private apiUrl = 'http://localhost:8080/api';

  constructor(
    private authService: AuthService,
    private router: Router,
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.nom = this.authService.getNom();
    this.role = this.authService.getRole();
    this.isAdmin = this.authService.isAdmin();
    this.loadStats();
  }

  loadStats() {
  this.loading = true;

  this.http.get<any[]>(`${this.apiUrl}/livres`).subscribe({
    next: (data) => this.stats.livres = data.length,
    error: () => this.stats.livres = 0
  });

  if (this.isAdmin) {
    this.http.get<any[]>(`${this.apiUrl}/emprunts`).subscribe({
      next: (data) => {
        this.stats.emprunts = data.length;
        this.stats.retards = data.filter(e => e.enRetard).length;
        this.recentEmprunts = data.slice(0, 5);
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => { this.loading = false; }
    });

    this.http.get<any[]>(`${this.apiUrl}/utilisateurs`).subscribe({
      next: (data) => this.stats.utilisateurs = data.length,
      error: () => this.stats.utilisateurs = 0
    });

  } else {

    const userId = this.authService.getUserId();
    this.http.get<any[]>(`${this.apiUrl}/emprunts/utilisateur/${userId}`).subscribe({
      next: (data) => {
        this.stats.emprunts = data.filter(e => !e.dateRetourEffective).length;
        this.stats.retards = data.filter(e => e.enRetard).length;
        this.recentEmprunts = data.slice(0, 5);
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => { this.loading = false; }
    });
  }
}

  logout() {
    this.authService.logout();
  }

  getRoleBadge(): string {
    switch (this.role) {
      case 'ADMIN': return 'bg-danger';
      case 'ENSEIGNANT': return 'bg-warning text-dark';
      case 'ETUDIANT': return 'bg-primary';
      default: return 'bg-secondary';
    }
  }

  getRoleLabel(): string {
    switch (this.role) {
      case 'ADMIN': return 'Bibliothécaire';
      case 'ENSEIGNANT': return 'Enseignant';
      case 'ETUDIANT': return 'Étudiant';
      default: return this.role;
    }
  }
}
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../core/services/auth';
import { Navbar } from '../../../shared/navbar/navbar';

@Component({
  selector: 'app-emprunts',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule,Navbar],
  templateUrl: './emprunts.html',
  styleUrl: './emprunts.css'
})
export class Emprunts implements OnInit {

  private apiUrl = 'http://localhost:8080/api';

  emprunts: any[] = [];
  filtered: any[] = [];
  loading = false;
  selectedStatut = '';

  constructor(private http: HttpClient, private authService: AuthService) {}

  ngOnInit() { this.loadEmprunts(); }

  loadEmprunts() {
    this.loading = true;
    this.http.get<any[]>(`${this.apiUrl}/emprunts`).subscribe({
      next: (data) => {
        this.emprunts = data;
        this.applyFilter();
        this.loading = false;
      },
      error: () => this.loading = false
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

  logout() { this.authService.logout(); }
}
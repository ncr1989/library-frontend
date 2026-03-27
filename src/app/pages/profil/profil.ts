import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../core/services/auth';
import { Navbar } from '../../shared/navbar/navbar';
import { ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-profil',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, Navbar],
  templateUrl: './profil.html',
  styleUrl: './profil.css'
})
export class Profil implements OnInit {

  user: any = null;
  loading = true;  
  editing = false;
  successMessage = '';
  errorMessage = '';

  form = {
    nom: '',
    prenom: '',
    telephone: ''
  };

  private apiUrl = 'http://localhost:8080/api';

  constructor(private http: HttpClient, public authService: AuthService,private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.loadUser();
  }

  loadUser() {
  this.loading = true;
  const userId = this.authService.getUserId();
  console.log('>>> userId:', userId);
  console.log('>>> role:', this.authService.getRole());
  console.log('>>> endpoint:', this.getEndpoint());

  if (!userId) {
    this.loading = false;
    return;
  }

  const endpoint = this.getEndpoint();
  this.http.get<any>(`${this.apiUrl}/${endpoint}/${userId}`).subscribe({
    next: (data) => {
      
      this.user = data;
      this.form.nom = data.nom || '';
      this.form.prenom = data.prenom || '';
      this.form.telephone = data.telephone || '';
      this.loading = false;
      this.cdr.detectChanges();
    },
    error: (err) => {
      console.log('>>> error:', err);
      this.loading = false;
      this.cdr.detectChanges();
    }
  });
}

  get roleLabel(): string {
    switch (this.authService.getRole()) {
      case 'ADMIN':      return 'Bibliothécaire';
      case 'ENSEIGNANT': return 'Enseignant';
      case 'ETUDIANT':   return 'Étudiant';
      default:           return '';
    }
  }

  get roleBadgeClass(): string {
    switch (this.authService.getRole()) {
      case 'ADMIN':      return 'bg-danger';
      case 'ENSEIGNANT': return 'bg-warning text-dark';
      default:           return 'bg-primary';
    }
  }

  get cautionSuffisante(): boolean {
    return (this.user?.caution || 0) > 0;
  }

  get cautionPercent(): number {
    const max = 20;
    return Math.min(100, ((this.user?.caution || 0) / max) * 100);
  }

  saveProfile() {
    this.errorMessage = '';
    const userId = this.authService.getUserId();
    const endpoint = this.getEndpoint();

    this.http.put(`${this.apiUrl}/${endpoint}/${userId}`, {
      ...this.user,
      nom: this.form.nom,
      prenom: this.form.prenom,
      telephone: this.form.telephone
    }).subscribe({
      next: () => {
        this.successMessage = 'Profil mis à jour avec succès.';
        this.editing = false;
        this.loadUser();
      },
      error: () => this.errorMessage = 'Erreur lors de la mise à jour.'
    });
  }

  getEndpoint(): string {
    switch (this.authService.getRole()) {
      case 'ADMIN':      return 'bibliothecaires';
      case 'ENSEIGNANT': return 'enseignants';
      default:           return 'etudiants';
    }
  }
}
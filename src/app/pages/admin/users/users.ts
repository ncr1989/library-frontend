import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../core/services/auth';
import { Navbar } from '../../../shared/navbar/navbar';
import { ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule,Navbar],
  templateUrl: './users.html',
  styleUrl: './users.css'
})
export class Users implements OnInit {

  private apiUrl = 'http://localhost:8080/api';

  utilisateurs: any[] = [];
  filtered: any[] = [];
  loading = false;
  errorMessage = '';
  successMessage = '';

  searchTerm = '';
  selectedRole = '';

  showModal = false;
  isEditing = false;

  form = {
    id: null,
    nom: '',
    prenom: '',
    email: '',
    password: '',
    telephone: '',
    role: 'ETUDIANT'
  };

  constructor(private http: HttpClient, private authService: AuthService,private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.loadUsers();
  }

  // loadUsers() {
  //   this.loading = true;
  //   this.http.get<any[]>(`${this.apiUrl}/utilisateurs`).subscribe({
  //     next: (data) => {
  //       this.utilisateurs = data;
  //       this.applyFilter();
  //       this.loading = false;
  //     },
  //     error: () => {
  //       this.errorMessage = 'Erreur lors du chargement des utilisateurs.';
  //       this.loading = false;
  //     }
  //   });
  // }

  loadUsers() {
  this.loading = true;

  this.http.get<any[]>(`${this.apiUrl}/utilisateurs`).subscribe({
    next: (data) => {
      console.log('API DATA:', data);

      this.utilisateurs = data;

      // ✅ ALWAYS initialize filtered directly
      this.filtered = data;
      

      this.loading = false;
      this.cdr.detectChanges();
    },
    error: () => {
      this.errorMessage = 'Erreur lors du chargement des utilisateurs.';
      this.loading = false;
    }
  });
}

  applyFilter() {
    this.filtered = this.utilisateurs.filter(u => {
      const matchSearch = !this.searchTerm ||
        u.nom?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        u.prenom?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        u.email?.toLowerCase().includes(this.searchTerm.toLowerCase());
      const matchRole = !this.selectedRole || this.getRole(u) === this.selectedRole;
      return matchSearch && matchRole;
    });
  }

  openAdd() {
    this.isEditing = false;
    this.form = { id: null, nom: '', prenom: '', email: '', password: '', telephone: '', role: 'ETUDIANT' };
    this.showModal = true;
  }

  openEdit(u: any) {
    this.isEditing = true;
    this.form = {
      id: u.id,
      nom: u.nom,
      prenom: u.prenom,
      email: u.email,
      password: '',
      telephone: u.telephone,
      role: this.getRole(u)
    };
    this.showModal = true;
  }

  save() {
    if (this.isEditing) {
      const endpoint = this.getRoleEndpoint(this.form.role);
      this.http.put(`${this.apiUrl}/${endpoint}/${this.form.id}`, this.form).subscribe({
        next: () => {
          this.successMessage = 'Utilisateur modifié avec succès.';
          this.showModal = false;
          this.loadUsers();
        },
        error: () => this.errorMessage = 'Erreur lors de la modification.'
      });
    } else {
      this.http.post(`${this.apiUrl}/auth/register`, this.form).subscribe({
        next: () => {
          this.successMessage = 'Utilisateur créé avec succès.';
          this.showModal = false;
          this.loadUsers();
        },
        error: () => this.errorMessage = 'Erreur lors de la création.'
      });
    }
  }

  delete(u: any) {
    if (!confirm(`Supprimer ${u.nom} ${u.prenom} ?`)) return;
    const endpoint = this.getRoleEndpoint(this.getRole(u));
    this.http.delete(`${this.apiUrl}/${endpoint}/${u.id}`).subscribe({
      next: () => {
        this.successMessage = 'Utilisateur supprimé.';
        this.loadUsers();
      },
      error: () => this.errorMessage = 'Erreur lors de la suppression.'
    });
  }

  getRole(u: any): string {
    if (u.numeroMatricule !== undefined) return 'BIBLIOTHECAIRE';
    if (u.nomDepartement !== undefined) return 'ENSEIGNANT';
    if (u.numeroEtudiant !== undefined) return 'ETUDIANT';
    return 'USER';
  }

  getRoleEndpoint(role: string): string {
    switch (role) {
      case 'BIBLIOTHECAIRE': return 'bibliothecaires';
      case 'ENSEIGNANT': return 'enseignants';
      default: return 'etudiants';
    }
  }

  getRoleBadgeClass(u: any): string {
    switch (this.getRole(u)) {
      case 'BIBLIOTHECAIRE': return 'bg-danger';
      case 'ENSEIGNANT': return 'bg-warning text-dark';
      default: return 'bg-primary';
    }
  }

  getRoleLabel(u: any): string {
    switch (this.getRole(u)) {
      case 'BIBLIOTHECAIRE': return 'Bibliothécaire';
      case 'ENSEIGNANT': return 'Enseignant';
      default: return 'Étudiant';
    }
  }

  getInitials(u: any): string {
    return `${u.nom?.[0] || ''}${u.prenom?.[0] || ''}`.toUpperCase();
  }

  logout() { this.authService.logout(); }
}
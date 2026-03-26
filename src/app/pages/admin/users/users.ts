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
  imports: [CommonModule, FormsModule, RouterModule, Navbar],
  templateUrl: './users.html',
  styleUrl: './users.css'
})
export class Users implements OnInit {

  private apiUrl = 'http://localhost:8080/api';

  utilisateurs: any[] = [];
  filtered: any[] = [];
  adresses: any[] = [];
  loading = false;
  errorMessage = '';
  successMessage = '';

  searchTerm = '';
  selectedRole = '';

  showModal = false;
  isEditing = false;

  form: any = {
    id: null,
    nom: '',
    prenom: '',
    email: '',
    password: '',
    telephone: '',
    caution: 0,
    role: 'ETUDIANT',
    adresse: {
      numero: '',
      rue: '',
      ville: '',
      codePostal: ''
    }
  };

  constructor(private http: HttpClient, private authService: AuthService,private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.loadUsers();
    this.loadAdresses();
  }

  loadUsers() {
    this.loading = true;
    this.http.get<any[]>(`${this.apiUrl}/utilisateurs`).subscribe({
      next: (data) => {
        this.utilisateurs = data;
        this.applyFilter();
        this.loading = false;
        this.cdr.detectChanges()
      },
      error: () => {
        this.errorMessage = 'Erreur lors du chargement des utilisateurs.';
        this.loading = false;
      }
    });
  }

  loadAdresses() {
    this.http.get<any[]>(`${this.apiUrl}/adresses`).subscribe({
      next: (data) => this.adresses = data,
      error: () => {}
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
    this.form = {
      id: null,
      nom: '',
      prenom: '',
      email: '',
      password: '',
      telephone: '',
      caution: 0,
      role: 'ETUDIANT',
      adresse: {
        numero: '',
        rue: '',
        ville: '',
        codePostal: ''
      }
    };
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
      caution: u.caution || 0,
      role: this.getRole(u),
      adresse: u.adresse ? { ...u.adresse } : {
        numero: '', rue: '', ville: '', codePostal: ''
      }
    };
    this.showModal = true;
  }

  save() {
    this.errorMessage = '';

    const hasAdresse = this.form.adresse?.rue && this.form.adresse?.ville;

    if (this.isEditing) {
      const endpoint = this.getRoleEndpoint(this.form.role);
      const payload: any = {
        nom: this.form.nom,
        prenom: this.form.prenom,
        email: this.form.email,
        telephone: this.form.telephone,
        caution: this.form.caution,
      };
      if (this.form.password) {
        payload.password = this.form.password;
      }
      if (hasAdresse) {
        payload.adresse = this.form.adresse;
      }

      this.http.put(`${this.apiUrl}/${endpoint}/${this.form.id}`, payload).subscribe({
        next: () => {
          this.successMessage = 'Utilisateur modifié avec succès.';
          this.showModal = false;
          this.loadUsers();
        },
        error: () => this.errorMessage = 'Erreur lors de la modification.'
      });

    } else {

      const registerPayload = {
        nom: this.form.nom,
        prenom: this.form.prenom,
        email: this.form.email,
        password: this.form.password,
        telephone: this.form.telephone,
        caution: this.form.caution,
        role: this.form.role,
        adresse: hasAdresse ? this.form.adresse : null
      };

      this.http.post(`${this.apiUrl}/auth/register`, registerPayload).subscribe({
        next: () => {
          this.successMessage = 'Utilisateur créé avec succès.';
          this.showModal = false;
          this.loadUsers();
        },
        error: (err) => {
          if (err.status === 409) {
            this.errorMessage = 'Cet email est déjà utilisé.';
          } else {
            this.errorMessage = 'Erreur lors de la création.';
          }
        }
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
     error: (err) => {
      if (err.status === 409) {
        this.errorMessage = err.error?.message || 'Suppression impossible.';
    } else {
        this.errorMessage = 'Erreur lors de la suppression.';
    }
    this.cdr.detectChanges();
      
}
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

  getAdresseLabel(u: any): string {
    if (!u.adresse) return '—';
    return `${u.adresse.numero} ${u.adresse.rue}, ${u.adresse.ville}`;
  }

  logout() { this.authService.logout(); }
}
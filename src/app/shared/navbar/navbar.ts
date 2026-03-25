import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/services/auth';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule, RouterLinkActive],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css'
})
export class Navbar {

  constructor(public authService: AuthService) {}

  get nom(): string {
    return this.authService.getNom();
  }

  get isAdmin(): boolean {
    return this.authService.isAdmin();
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
      case 'ETUDIANT':   return 'bg-primary';
      default:           return 'bg-secondary';
    }
  }

  logout() {
    this.authService.logout();
  }
}
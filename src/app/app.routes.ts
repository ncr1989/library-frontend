import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth-guard';
import { Login } from './pages/login/login';
import { Dashboard } from './pages/dashboard/dashboard';
import { Users } from './pages/admin/users/users';
import { Ouvrages } from './pages/admin/ouvrages/ouvrages';
import { Emprunts } from './pages/admin/emprunts/emprunts';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: Login },
  { path: 'dashboard', component: Dashboard, canActivate: [authGuard] },
  { path: 'admin/users', component: Users, canActivate: [authGuard] },
  { path: 'admin/ouvrages', component: Ouvrages, canActivate: [authGuard] },
  { path: 'admin/emprunts', component: Emprunts, canActivate: [authGuard] },
  { path: '**', redirectTo: 'login' }
];
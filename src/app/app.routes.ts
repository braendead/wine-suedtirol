import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: 'home', loadComponent: () => import('./features/home/home.component') },
  { path: 'kellerei/:id', loadComponent: () => import('./features/kellerei-detail/kellerei-detail.component') },
  { path: 'wine-awards', loadComponent: () => import('./features/wine-awards/wine-awards.component') },
  { path: 'profil', loadComponent: () => import('./features/profil/profil.component'), canActivate: [authGuard] },
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: '**', redirectTo: 'home' }
];

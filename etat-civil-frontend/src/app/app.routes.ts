import { Routes } from '@angular/router';
import { LoginComponent } from './features/citoyen/login/login.component';
import { RegisterComponent } from './features/citoyen/register/register.component';
import { HomeComponent } from './features/home/home.component';

export const routes: Routes = [
  {
    path: 'home',
    loadComponent: () => import('./features/home/home.component').then(m => m.HomeComponent)
  },
  {
    path: 'citoyen/login',
    loadComponent: () => import('./features/citoyen/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'citoyen/register',
    loadComponent: () => import('./features/citoyen/register/register.component').then(m => m.RegisterComponent)
  },
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full'
  },
  // {
  //   path: '**',
  //   redirectTo: 'home'
  // }
];

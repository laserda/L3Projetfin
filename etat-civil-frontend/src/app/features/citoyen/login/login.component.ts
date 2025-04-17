// Connexion utilisateur citoyen
// À compléter avec le template Angular

import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <h2>Connexion Citoyen</h2>
    <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
      <label>Email:</label>
      <input formControlName="email" type="email" required />
      <div *ngIf="loginForm.get('email')?.invalid && loginForm.get('email')?.touched">Email requis</div>
      <label>Mot de passe:</label>
      <input formControlName="password" type="password" required />
      <div *ngIf="loginForm.get('password')?.invalid && loginForm.get('password')?.touched">Mot de passe requis</div>
      <button type="submit" [disabled]="loginForm.invalid">Se connecter</button>
      <div *ngIf="errorMessage" class="error">{{ errorMessage }}</div>
    </form>
  `,
  styles: [`.error { color: red; }`]
})
export class LoginComponent {
  loginForm: FormGroup;
  errorMessage = '';

  constructor(private fb: FormBuilder, private authService: AuthService) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]]
    });
  }

  onSubmit() {
    if (this.loginForm.valid) {
      this.authService.login(this.loginForm.value).subscribe({
        next: (res) => {
          // Stocker le token, rediriger, etc.
          this.errorMessage = '';
        },
        error: (err) => {
          this.errorMessage = err?.error?.message || 'Erreur lors de la connexion';
        }
      });
    }
  }
}

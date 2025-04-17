// Formulaire inscription citoyen
// À compléter avec le template Angular

import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { CommonModule } from '@angular/common';

function formatDateToYYYYMMDD(dateStr: string): string {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <h2>Inscription Citoyen</h2>
    <form [formGroup]="registerForm" (ngSubmit)="onSubmit()">
      <label>Email:</label>
      <input formControlName="email" type="email" required />
      <div *ngIf="registerForm.get('email')?.invalid && registerForm.get('email')?.touched">Email invalide</div>
      <label>Téléphone:</label>
      <input formControlName="telephone" type="tel" required />
      <div *ngIf="registerForm.get('telephone')?.invalid && registerForm.get('telephone')?.touched">Téléphone requis</div>
      <label>Nom:</label>
      <input formControlName="nom" type="text" required />
      <div *ngIf="registerForm.get('nom')?.invalid && registerForm.get('nom')?.touched">Nom requis</div>
      <label>Prénom:</label>
      <input formControlName="prenom" type="text" required />
      <div *ngIf="registerForm.get('prenom')?.invalid && registerForm.get('prenom')?.touched">Prénom requis</div>
      <label>Date de naissance:</label>
      <input formControlName="dateNaissance" type="date" required />
      <div *ngIf="registerForm.get('dateNaissance')?.invalid && registerForm.get('dateNaissance')?.touched">Date invalide</div>
      <label>Lieu de naissance:</label>
      <input formControlName="lieuNaissance" type="text" required />
      <div *ngIf="registerForm.get('lieuNaissance')?.invalid && registerForm.get('lieuNaissance')?.touched">Lieu requis</div>
      <label>Adresse:</label>
      <input formControlName="adresse" type="text" required />
      <div *ngIf="registerForm.get('adresse')?.invalid && registerForm.get('adresse')?.touched">Adresse requise</div>
      <label>Mot de passe:</label>
      <input formControlName="password" type="password" required />
      <div *ngIf="registerForm.get('password')?.invalid && registerForm.get('password')?.touched">Mot de passe requis (min 6 caractères)</div>
      <button type="submit" [disabled]="registerForm.invalid">Créer mon compte</button>
      <div *ngIf="errorMessage" class="error">{{ errorMessage }}</div>
      <div *ngIf="successMessage" class="success">{{ successMessage }}</div>
    </form>
  `,
  styles: [`.error { color: red; } .success { color: green; }`]
})
export class RegisterComponent {
  registerForm: FormGroup;
  errorMessage = '';
  successMessage = '';

  constructor(private fb: FormBuilder, private authService: AuthService) {
    this.registerForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      telephone: ['', [Validators.required]],
      nom: ['', [Validators.required]],
      prenom: ['', [Validators.required]],
      dateNaissance: ['', [Validators.required]],
      lieuNaissance: ['', [Validators.required]],
      adresse: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  onSubmit() {
    if (this.registerForm.valid) {
      const formValue = { ...this.registerForm.value };
      formValue.dateNaissance = formatDateToYYYYMMDD(formValue.dateNaissance);
      this.authService.register(formValue).subscribe({
        next: () => {
          this.successMessage = 'Inscription réussie !';
          this.errorMessage = '';
          this.registerForm.reset();
        },
        error: (err) => {
          this.errorMessage = err?.error?.message || 'Erreur lors de l\'inscription';
          this.successMessage = '';
        }
      });
    }
  }
}

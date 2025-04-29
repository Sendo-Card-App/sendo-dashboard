import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService } from 'src/app/@theme/services/users.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SharedModule } from 'src/app/demo/shared/shared.module';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-ac-password',
  standalone: true,
  imports: [
    CommonModule,
    SharedModule,
    FormsModule,
    MatButtonModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './ac-password.component.html',
  styleUrls: ['../account-profile.scss', './ac-password.component.scss']
})
export class AcPasswordComponent {
  // Form fields
  hide = true;
  newHide = true;
  conHide = true;
  oldPassword = '';
  newPassword = '';
  confirmPassword = '';
  passwordStrength = '';
  loading = false;

  // Password requirements
  passwordRequirements = [
    { title: 'Minimum 8 caractères', valid: false },
    { title: '1 lettre minuscule (a-z)', valid: false },
    { title: '1 lettre majuscule (A-Z)', valid: false },
    { title: '1 chiffre (0-9)', valid: false },
    { title: '1 caractère spécial (@$!%*?&)', valid: false }
  ];

  constructor(
    private userService: UserService,
    private snackBar: MatSnackBar
  ) {}

  checkPassword() {
    this.passwordRequirements[0].valid = this.newPassword.length >= 8;
    this.passwordRequirements[1].valid = /[a-z]/.test(this.newPassword);
    this.passwordRequirements[2].valid = /[A-Z]/.test(this.newPassword);
    this.passwordRequirements[3].valid = /\d/.test(this.newPassword);
    this.passwordRequirements[4].valid = /[@$!%*?&]/.test(this.newPassword);
  }

  isFormValid() {
    return this.oldPassword &&
           this.newPassword &&
           this.confirmPassword &&
           this.newPassword === this.confirmPassword &&
           this.passwordRequirements.every(req => req.valid);
  }

  onSubmit() {
    if (!this.isFormValid()) {
      this.snackBar.open('Veuillez remplir correctement tous les champs', 'Fermer', { duration: 3000 });
      return;
    }

    this.loading = true;
    this.userService.updatePassword(this.oldPassword, this.newPassword)
      .subscribe({
        next: (response) => {
          this.snackBar.open(response.message || 'Mot de passe mis à jour avec succès', 'Fermer', { duration: 5000 });
          this.resetForm();
        },
        error: (error) => {
          this.snackBar.open(error.error?.message || 'Échec de la mise à jour du mot de passe', 'Fermer', { duration: 5000 });
        },
        complete: () => {
          this.loading = false;
        }
      });
  }

  private resetForm() {
    this.oldPassword = '';
    this.newPassword = '';
    this.confirmPassword = '';
    this.passwordRequirements.forEach(req => req.valid = false);
  }
}

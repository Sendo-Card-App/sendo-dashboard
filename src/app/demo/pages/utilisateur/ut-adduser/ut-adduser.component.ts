import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AdminService, Role } from 'src/app/@theme/services/admin.service';
import { UserService } from 'src/app/@theme/services/users.service';
import { CommonModule } from '@angular/common';
import { SharedModule } from 'src/app/demo/shared/shared.module';
import { HttpErrorResponse } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-ut-adduser',
  standalone: true,
  imports: [CommonModule, SharedModule],
  templateUrl: './ut-adduser.component.html',
  styleUrl: './ut-adduser.component.scss'
})
export class UtAdduserComponent {

  invitationForm: FormGroup;
    roles: Role[] = [];
    isLoading = false;
    isSuccess = false;
    errorMessage: string | null = null;

    constructor(
      private fb: FormBuilder,
      private adminService: AdminService,
      private userService: UserService,
      private snackbar: MatSnackBar
    ) {
      this.invitationForm = this.fb.group({
        firstname: ['', [Validators.required, Validators.maxLength(50)]],
        lastname: ['', [Validators.required, Validators.maxLength(50)]],
        email: ['', [Validators.required, Validators.email, Validators.maxLength(100)]],
        phone: ['', [Validators.pattern(/^[0-9]{9,15}$/)]],
        address: ['', [Validators.maxLength(200)]],
        dateOfBirth: ['', Validators.required],
        placeOfBirth: ['', Validators.required],
        roleId: [null, Validators.required]
      });
    }

    ngOnInit(): void {
      this.loadRoles();
    }

    loadRoles(): void {
      this.adminService.getAllRoles().subscribe({
        next: (roles) => {
          this.roles = roles;
        },
        error: (err) => {
          console.error('Failed to load roles', err);
          this.errorMessage = 'Impossible de charger les rôles';
        }
      });
    }

    onSubmit(): void {
      if (this.invitationForm.invalid) {
        this.markFormGroupTouched(this.invitationForm);
        return;
      }

      this.isLoading = true;
      this.errorMessage = null;
      this.isSuccess = false;

      const formData = this.invitationForm.value;

      // Format dateOfBirth as DD/MM/YYYY string
      const date = new Date(formData.dateOfBirth);
      const formattedDateOfBirth = [
        String(date.getDate()).padStart(2, '0'),
        String(date.getMonth() + 1).padStart(2, '0'),
        date.getFullYear()
      ].join('/');

      this.userService.createUser({
        firstname: formData.firstname,
        lastname: formData.lastname,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        dateOfBirth: formattedDateOfBirth,
        placeOfBirth: formData.placeOfBirth,
        roleId: formData.roleId
      }).subscribe({
        next: (response) => {
          if (response.status === 200) {
            this.invitationForm.reset();
            this.isSuccess = true;
        setTimeout(() => this.isSuccess = false, 3000);

        this.snackbar.open('Utilisateur créé avec succès', 'Fermer', {
          duration: 3000
        });
          } else {
        this.errorMessage = response.message || 'Erreur lors de la création';
          }
        },
        error: (err) => {
          // console.error('API Error:', err);
          // console.log("Erreur lors de la création de l'utilisateur", formData);
             this.isLoading = false;
        this.snackbar.open(`Erreur lors de la création de l'utilisateur ${formData.firstname} ${formData.lastname}`, 'Fermer', {
          duration: 3000
        });
          this.errorMessage = this.getErrorMessage(err);
        },
        complete: () => {
          this.isLoading = false;

        }
      });
    }

    private markFormGroupTouched(formGroup: FormGroup): void {
      Object.values(formGroup.controls).forEach(control => {
        control.markAsTouched();
        if (control instanceof FormGroup) {
          this.markFormGroupTouched(control);
        }
      });
    }

    private getErrorMessage(error: HttpErrorResponse): string {
      if (error.error?.message) {
        return error.error.message;
      }
      if (error.error?.errors) {
        return Object.values(error.error.errors).join(', ');
      }
      return 'Une erreur est survenue lors de la création';
    }
}

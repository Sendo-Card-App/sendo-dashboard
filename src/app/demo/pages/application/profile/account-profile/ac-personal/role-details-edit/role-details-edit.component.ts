import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SharedModule } from 'src/app/demo/shared/shared.module';
import { AdminService } from 'src/app/@theme/services/admin.service';

@Component({
  selector: 'app-role-details-edit',
  standalone: true,
  imports: [CommonModule, SharedModule, ReactiveFormsModule],
  templateUrl: './role-details-edit.component.html',
  styleUrls: ['./role-details-edit.component.scss']
})
export class RoleDetailsEditComponent {
  private dialogRef = inject(MatDialogRef<RoleDetailsEditComponent>);
  private adminService = inject(AdminService);
  private snackBar = inject(MatSnackBar);
  private fb = inject(FormBuilder);
  private data = inject(MAT_DIALOG_DATA);

  roleForm: FormGroup;
  isSubmitting = false;

  constructor() {
    this.roleForm = this.fb.group({
      name: [this.data.role.name, [Validators.required, Validators.minLength(3)]]
    });
  }

  onSubmit(): void {
    if (this.roleForm.invalid) {
      this.roleForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    const { name } = this.roleForm.value;

    this.adminService.updateRole(this.data.role.id, name).subscribe({
      next: (updatedRole) => {
        this.snackBar.open('Rôle mis à jour avec succès', 'Fermer', {
          duration: 3000,
          panelClass: ['success-snackbar']
        });
        this.dialogRef.close(updatedRole);
      },
      error: (err) => {
        this.snackBar.open('Erreur lors de la mise à jour', 'Fermer', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
        this.isSubmitting = false;
      }
    });
  }

  onDelete(): void {
    // Implémentez la suppression si nécessaire
  }
}

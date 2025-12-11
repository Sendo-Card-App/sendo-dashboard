import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AdminService } from 'src/app/@theme/services/admin.service';
import { MeResponse, RoleUser } from 'src/app/@theme/models';
import { SharedModule } from 'src/app/demo/shared/shared.module';

@Component({
  selector: 'app-role-add',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule,SharedModule],
  templateUrl: './role-add.component.html',
  styleUrls: ['./role-add.component.scss']
})
export class RoleAddComponent {
  private dialogRef = inject(MatDialogRef<RoleAddComponent>);
  private adminService = inject(AdminService);
  private snackBar = inject(MatSnackBar);
  private fb = inject(FormBuilder);
  private data = inject(MAT_DIALOG_DATA);
  user: MeResponse['user'] = this.data.user;

  roleForm: FormGroup;
  allRoles: RoleUser[] = [];
  isLoading = true;
  isSubmitting = false;

  constructor() {
    this.roleForm = this.fb.group({
      selectedRoleId: [null, Validators.required]
    });
    this.loadRoles();
  }

  loadRoles(): void {
    this.adminService.getAllRoles().subscribe({
      next: (roles) => {
        // Filtrer les rôles que l'utilisateur possède déjà
        console.log('user : ', this.user)
        const userRoleIds = this.user.roles.map(role => role.id);
        console.log('roles : ', roles)
        this.allRoles = roles
          .filter(role => !userRoleIds.includes(role.id))
          .map(role => ({
            ...role,
            createdAt: role.createdAt || new Date().toISOString(),
            updatedAt: role.updatedAt || new Date().toISOString()
          }));

        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading roles:', error);
        this.isLoading = false;
      }
    });
  }

  assignRole(): void {
    if (this.roleForm.invalid || this.isSubmitting) return;

    this.isSubmitting = true;
    const roleId = this.roleForm.value.selectedRoleId;

    this.adminService.assignRolesToUser(this.user.id, [roleId]).subscribe({
      next: () => {
        this.snackBar.open('Rôle attribué avec succès', 'Fermer', { duration: 3000 });
        this.dialogRef.close(true);
      },
      error: (error) => {
        console.error('Error assigning role:', error);
        this.snackBar.open('Erreur lors de l\'attribution', 'Fermer', { duration: 3000 });
        this.isSubmitting = false;
      }
    });
  }
}

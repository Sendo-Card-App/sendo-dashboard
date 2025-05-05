// angular import
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';

// project import
import { SharedModule } from 'src/app/demo/shared/shared.module';
import { AdminService } from 'src/app/@theme/services/admin.service';
import { DatePipe } from '@angular/common';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { RoleDetailsEditComponent } from './role-details-edit/role-details-edit.component';
import { RoleUser } from 'src/app/@theme/models';



@Component({
  selector: 'app-ac-role',
  standalone: true,
  imports: [CommonModule, SharedModule, MatTableModule, DatePipe],
  templateUrl: './ac-personal.component.html',
  styleUrls: ['../account-profile.scss', './ac-personal.component.scss']
})
export class AcPersonalComponent implements OnInit {
  displayedColumns: string[] = ['id', 'name', 'createdAt', 'updatedAt', 'actions'];
  dataSource: RoleUser[] = [];
  loading = true;
  form: FormGroup;
  submitting = false;


  constructor(
    private adminService: AdminService,
    private fb: FormBuilder,
     private snackBar: MatSnackBar,
     private dialog: MatDialog,
  ) {
    this.form = this.fb.group({
      name: ['',Validators.required],
    });
  }

  ngOnInit(): void {
    this.loadRoles();
  }

  loadRoles(): void {
    this.adminService.getAllRoles().subscribe({
      next: (roles) => {
        this.dataSource = roles.map(role => ({
          ...role,
          createdAt: role.createdAt || new Date().toISOString(),
          updatedAt: role.updatedAt || new Date().toISOString()
        }));
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading roles:', error);
        this.loading = false;
      }
    });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      return;
    }
    this.submitting = true;
    this.adminService.createRole(this.form.value.name).subscribe({
      next: role => {
        const now = new Date().toISOString();
        const newRole: RoleUser = {
          id: role.id,
          name: role.name,
          createdAt: role.createdAt || now,
          updatedAt: role.updatedAt || now
        };
        this.dataSource = [newRole, ...this.dataSource];
        this.form.reset();

        this.snackBar.open('Role creer avec succes', 'Fermer', {
          duration: 3000,
          panelClass: ['success-snackbar']
        });
        this.loadRoles();
        this.submitting = false;
      },
      error: err => {
        console.error('Erreur création rôle', err);
        this.snackBar.open('Erreur lors de la création du rôle', 'Fermer', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
        this.form.reset();
        this.submitting = false;
      }
    });
  }

  getRoleBadgeClass(roleName: string): string {
    switch(roleName) {
      case 'SUPER_ADMIN':
        return 'badge-super-admin';
      case 'ADMIN':
        return 'badge-admin';
      default:
        return 'badge-default';
    }
  }

  openEditDialog(role: RoleUser): void {
    const dialogRef = this.dialog.open(RoleDetailsEditComponent, {
      width: '500px',
      data: { role }
    });

    dialogRef.afterClosed().subscribe(updatedRole => {
      if (updatedRole) {
        const index = this.dataSource.findIndex(r => r.id === updatedRole.id);
        if (index !== -1) {
          this.dataSource = this.dataSource.map(r =>
            r.id === updatedRole.id ? updatedRole : r
          );
        }
      }
    });
  }
}

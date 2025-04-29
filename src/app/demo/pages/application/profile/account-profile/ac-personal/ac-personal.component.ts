// angular import
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';

// project import
import { SharedModule } from 'src/app/demo/shared/shared.module';
import { AdminService } from 'src/app/@theme/services/admin.service';
import { DatePipe } from '@angular/common';

export interface RoleUser {
  id: number;
  name: string;
  createdAt: string;
  updatedAt: string;
}

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

  constructor(private adminService: AdminService) {}

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
}

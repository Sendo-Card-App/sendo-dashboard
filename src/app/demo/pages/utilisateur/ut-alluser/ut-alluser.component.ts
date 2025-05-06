// ut-alluser.component.ts
import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { MatTableDataSource }          from '@angular/material/table';
import { MatPaginator, PageEvent }    from '@angular/material/paginator';
import { MatSort }                    from '@angular/material/sort';
import { finalize }                   from 'rxjs/operators';
import { ChangeUserStatusRequest, MeResponse }                 from 'src/app/@theme/models';
import { UserService }                from 'src/app/@theme/services/users.service';
import { SharedModule } from 'src/app/demo/shared/shared.module';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from 'src/app/@theme/components/confirm-dialog/confirm-dialog.component';
import { RolePayload } from '../ut-updateuser/ut-updateuser.component';
import { AdminService } from 'src/app/@theme/services/admin.service';

@Component({
  selector: 'app-ut-alluser',
  templateUrl: './ut-alluser.component.html',
  imports: [CommonModule, SharedModule, RouterModule],
  styleUrls: ['./ut-alluser.component.scss']
})
export class UtAlluserComponent implements AfterViewInit {
  displayedColumns = ['name', 'email', 'role', 'phone', 'status', 'createdAt', 'action'];
  dataSource = new MatTableDataSource<MeResponse>();
  isLoading  = false;
  totalItems = 0;
  currentPage = 1;
  itemsPerPage = 10;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort)      sort!: MatSort;

  constructor(private userService: UserService, private dialog: MatDialog,
    private snackBar: MatSnackBar,private adminService: AdminService) {
    this.loadUsers();
  }

  ngAfterViewInit() {
    // lie pagination + tri
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort      = this.sort;

    // on définit le predicate de filtrage
    this.dataSource.filterPredicate = (user, filter) => {
      const dataStr = [
        user.firstname,
        user.lastname,
        user.email,
        user.roles?.map((role: RolePayload) => role.name).join(' '),
      ].join(' ').toLowerCase();
      return dataStr.includes(filter);
    };
  }

  loadUsers(page = this.currentPage, limit = this.itemsPerPage) {
    this.isLoading = true;
    this.userService.getUsers(page, limit)
      .pipe(finalize(() => this.isLoading = false))
      .subscribe(resp => {
        this.dataSource.data = resp.data.items;
        this.totalItems      = resp.data.totalItems;
        this.currentPage     = resp.data.page;
      });
  }

  applyFilter(value: string) {
    const filterValue = value.trim().toLowerCase();
    this.dataSource.filter = filterValue;
    // remise à la première page si paginé
    if (this.paginator) {
      this.paginator.firstPage();
    }
  }

  onPageChange(e: PageEvent) {
    this.itemsPerPage = e.pageSize;
    this.currentPage  = e.pageIndex + 1;
    this.loadUsers(this.currentPage, this.itemsPerPage);
  }

  formatUserName(user: MeResponse): string {
    return `${user.firstname} ${user.lastname}`.trim();
  }
  formatRoleName(role: RolePayload): string {
    return role?.name || 'N/A';
  }
  // avatar…
  getStableColor(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const h = hash % 360;
    return `hsl(${h}, 70%, 60%)`;
  }

  // Version alternative avec couleur stable
  createStableAvatar(user: MeResponse): { letter: string; color: string } {
    const firstLetter = user.firstname ? user.firstname.charAt(0).toUpperCase() : '?';
    return {
      letter: firstLetter,
      color: this.getStableColor(user.firstname + user.lastname)
    };
  }

  deleteUser(userId: number | string): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Alerte suppression',
        message: 'Êtes-vous sûr de vouloir supprimer cet utilisateur ? Cette action est irréversible.',
        confirmText: 'Supprimer',
        cancelText: 'Annuler'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.performUserDeletion(userId);
      }
    });
  }

  private performUserDeletion(userId: number | string): void {
    this.userService.deleteUser(userId).subscribe({
      next: () => {
        this.snackBar.open('Utilisateur supprimé avec succès', 'Fermer', {
          duration: 3000,
          panelClass: ['success-snackbar']
        });
        // Recharger les données ou filtrer l'utilisateur supprimé
        this.loadUsers();
      },
      error: (err) => {
        this.snackBar.open('Échec de la suppression', 'Fermer', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
        console.error('Delete error:', err);
      }
    });
  }

  toggleUserStatus(email: string, currentStatus: string): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Changement de statut',
        message: `Êtes-vous sûr de vouloir ${currentStatus === 'ACTIVE' ? 'suspendre' : 'activer'} cet utilisateur ?`,
        confirmText: 'Confirmer',
        cancelText: 'Annuler'
      }
    });

    dialogRef.afterClosed().subscribe(confirm => {
      if (confirm) {
        const newStatus = currentStatus === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
        const payload: ChangeUserStatusRequest = { email, status: newStatus };
        console.log('Payload:', payload);

        this.isLoading = true;
        this.adminService.changeUserStatus(payload).subscribe({
          next: () => {
            this.snackBar.open(`Statut changé à ${newStatus}`, 'Fermer', { duration: 3000 });
            this.loadUsers(); // Recharger les données
          },
          error: (error) => {
            this.snackBar.open('Échec du changement de statut', 'Fermer', { duration: 3000 });
            console.error('Error:', error);
            this.isLoading = false;
          }
        });
      }
    });
  }


}

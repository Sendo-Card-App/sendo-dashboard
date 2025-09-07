// ut-alluser.component.ts
import { AfterViewInit, Component, ViewChild, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { finalize } from 'rxjs/operators';
import { ChangeUserStatusRequest, MeResponse } from 'src/app/@theme/models';
import { UserService } from 'src/app/@theme/services/users.service';
import { SharedModule } from 'src/app/demo/shared/shared.module';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from 'src/app/@theme/components/confirm-dialog/confirm-dialog.component';
import { RolePayload } from '../ut-updateuser/ut-updateuser.component';
import { AdminService } from 'src/app/@theme/services/admin.service';
import { FormBuilder, FormGroup } from '@angular/forms';
import { AuthenticationService } from 'src/app/@theme/services/authentication.service';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CountryService } from 'src/app/@theme/services/country.service';

@Component({
  selector: 'app-ut-alluser',
  templateUrl: './ut-alluser.component.html',
  imports: [CommonModule, SharedModule, RouterModule, MatTooltipModule],
  styleUrls: ['./ut-alluser.component.scss']
})
export class UtAlluserComponent implements AfterViewInit, OnInit {
  displayedColumns = ['name', 'email', 'phone', 'status', 'createdAt', 'action'];
  dataSource = new MatTableDataSource<MeResponse>();
  filteredData: MeResponse[] = []; // Nouvelle propriété pour stocker les données filtrées
  isLoading = false;
  totalItems = 0;
  currentPage = 1;
  itemsPerPage = 10;
  searchText = '';
  filterForm: FormGroup;
  currentuserRole: string | undefined;
  countries: string[] = [];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private userService: UserService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private adminService: AdminService,
    private fb: FormBuilder,
    private authentificationService: AuthenticationService,
    private countryService: CountryService
  ) {
    this.filterForm = this.fb.group({
      status: [''], // Pour le filtre de rôle
      country: [''] // Pour le filtre de pays
    });

  }

  private setupFilterListeners(): void {
    // Écoute les changements du formulaire de filtrage
    this.filterForm.valueChanges.subscribe(() => {
      this.applyRoleFilter();
      this.applyCountryFilter();
    });
  }

  ngOnInit(): void {

    this.currentuserRole = this.authentificationService.currentUserValue?.user.role;
    this.loadUsers();
    this.setupFilterListeners();
    this.countryService.getCountries().subscribe({
      next: (data) => {
        console.log('Countries data:', data);
        this.countries = data.sort((a, b) => a.localeCompare(b));
      },
      error: (err) => console.error('Erreur chargement pays', err)
    });
  }

  ngAfterViewInit() {
    // this.dataSource.paginator = this.paginator;
    // this.dataSource.sort = this.sort;

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

  loadUsers() {
    this.isLoading = true;
    this.userService.getUsers(this.currentPage, this.itemsPerPage)
      .pipe(finalize(() => this.isLoading = false))
      .subscribe(resp => {
        this.filteredData = resp.data.items; // Stocke les données originales
        this.dataSource.data = this.filteredData; // Initialise avec toutes les données
        this.totalItems = resp.data.totalItems;
        this.currentPage = resp.data.page;
        this.applyRoleFilter(); // Applique le filtre après le chargement
        this.applyCountryFilter(); // Applique le filtre après le chargement
      });
  }

  applyFilter(value: string) {
    this.searchText = value.trim().toLowerCase();
    this.dataSource.filter = this.searchText;
    if (this.paginator) {
      this.paginator.firstPage();
    }

  }

  applyRoleFilter(): void {
    const roleFilter = this.filterForm.get('status')?.value;

    console.log('Role filter:', roleFilter);


    if (!roleFilter) {
      this.dataSource.data = this.filteredData;
    } else {
      console.log('Filtered data:', this.dataSource.data);
      this.dataSource.data = this.filteredData.filter(user => {
        // console.log('User roles:', this.filteredData);
        if (roleFilter === 'ADMIN') {
          // Un admin est défini comme ayant plus d'un rôle
          return user.roles && user.roles.length > 1;
        } else if (roleFilter === 'USER') {
          // Un user est défini comme ayant exactement un rôle
          return user.roles && user.roles.length === 1;
        }
        return true;
      });
    }

    // Mise à jour de la pagination
    // if (this.paginator) {
    //   this.paginator.firstPage();
    // }
  }

  applyCountryFilter(): void {
    const countryFilter = this.filterForm.get('country')?.value;

    if (!countryFilter) {
      this.dataSource.data = this.filteredData;
    } else {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      this.dataSource.data = this.filteredData.filter(user => (user as any).country === countryFilter);
    }

    // Mise à jour de la pagination
    if (this.paginator) {
      this.paginator.firstPage();
    }
  }

  resetFilters(): void {
    this.filterForm.reset({ status: '', country: '' });
    this.searchText = '';
    this.applyFilter('');
  }



  onPageChange(e: PageEvent) {
    this.itemsPerPage = e.pageSize;
    this.currentPage = e.pageIndex + 1;
    this.loadUsers();
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

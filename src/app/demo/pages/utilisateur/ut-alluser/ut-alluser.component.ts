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
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-ut-alluser',
  templateUrl: './ut-alluser.component.html',
  imports: [CommonModule, SharedModule, RouterModule, MatTooltipModule],
  styleUrls: ['./ut-alluser.component.scss']
})
export class UtAlluserComponent implements AfterViewInit, OnInit {
  displayedColumns = ['name', 'email', 'phone', 'status', 'createdAt', 'action'];
  dataSource = new MatTableDataSource<MeResponse['user']>();
  isLoading = false;
  totalItems = 0;
  currentPage = 1;
  itemsPerPage = 10;
  searchText = '';
  filterForm: FormGroup;
  currentuserRole: string[] | undefined;
  countries: string[] = [];

  // Subject pour la recherche avec debounce
  private searchSubject = new Subject<string>();

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
      status: [''],
      country: ['']
    });
  }
  ngAfterViewInit(): void {
    throw new Error('Method not implemented.');
  }

  private setupFilterListeners(): void {
    // Recherche avec debounce (300ms)
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged()
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    ).subscribe(searchText => {
      this.currentPage = 1; // Reset à la première page
      this.loadUsers();
    });

    // Filtres avec reset de pagination
    this.filterForm.valueChanges.subscribe(() => {
      this.currentPage = 1;
      this.loadUsers();
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



  loadUsers() {
    this.isLoading = true;

    // Récupérer les valeurs des filtres
    const roleFilter = this.filterForm.get('status')?.value;
    const countryFilter = this.filterForm.get('country')?.value;

    // Appeler le service avec tous les paramètres
    this.userService.getUsers(
      this.currentPage,
      this.itemsPerPage,
      countryFilter || null,
      this.searchText || null
    )
      .pipe(finalize(() => this.isLoading = false))
      .subscribe(resp => {
        // Appliquer le filtre de rôle côté client si nécessaire
        // (ou mieux, l'ajouter aussi côté serveur)
        let filteredData = resp.data.items;

        if (roleFilter) {
          filteredData = this.applyRoleFilterLocal(filteredData, roleFilter);
        }

        this.dataSource.data = filteredData;
        this.totalItems = roleFilter ? filteredData.length : resp.data.totalItems;
        this.currentPage = resp.data.page;
      });
  }

  // Appliquer le filtre de rôle localement (temporaire)
  private applyRoleFilterLocal(users: MeResponse['user'][], roleFilter: string): MeResponse['user'][] {
    return users.filter(user => {
      if (roleFilter === 'ADMIN') {
        return user.roles && user.roles.length > 1;
      } else if (roleFilter === 'USER') {
        return user.roles && user.roles.length === 1;
      }
      return true;
    });
  }

  // Nouvelle méthode pour la recherche
  applyFilter(value: string) {
    this.searchText = value.trim().toLowerCase();
    this.searchSubject.next(this.searchText);
  }

  // Supprimer les anciennes méthodes de filtrage local
  // applyRoleFilter(): void { ... }
  // applyCountryFilter(): void { ... }

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

  // Les autres méthodes restent inchangées...
  formatUserName(user: MeResponse['user']): string {
    return `${user.firstname} ${user.lastname}`.trim();
  }

  formatRoleName(role: RolePayload): string {
    return role?.name || 'N/A';
  }

  getStableColor(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const h = hash % 360;
    return `hsl(${h}, 70%, 60%)`;
  }

  createStableAvatar(user: MeResponse['user']): { letter: string; color: string } {
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
            this.loadUsers();
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

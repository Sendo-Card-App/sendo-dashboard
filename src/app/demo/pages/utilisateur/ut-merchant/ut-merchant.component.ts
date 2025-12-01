// ut-merchant.component.ts
import { AfterViewInit, Component, ViewChild, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { finalize } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatTooltipModule } from '@angular/material/tooltip';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { Subject } from 'rxjs';

// Interfaces
import { MerchantItem, MerchantListResponse } from 'src/app/@theme/models/merchant';
// import { AdminService } from 'src/app/@theme/services/admin.service';
import { AuthenticationService } from 'src/app/@theme/services/authentication.service';
import { ConfirmDialogComponent } from 'src/app/@theme/components/confirm-dialog/confirm-dialog.component';
import { SharedModule } from 'src/app/demo/shared/shared.module';
import { UserService } from 'src/app/@theme/services/users.service';

@Component({
  selector: 'app-ut-merchant',
  templateUrl: './ut-merchant.component.html',
  imports: [CommonModule, SharedModule, RouterModule, MatTooltipModule],
  styleUrls: ['./ut-merchant.component.scss']
})
export class UtMerchantComponent implements AfterViewInit, OnInit {
  displayedColumns = ['name', 'email', 'phone', 'status', 'wallet', 'createdAt', 'action'];
  dataSource = new MatTableDataSource<MerchantItem>();
  isLoading = false;
  totalItems = 0;
  currentPage = 1;
  itemsPerPage = 10;
  searchText = '';
  filterForm: FormGroup;
  currentuserRole: string[] | undefined;

  // Subject pour la recherche avec debounce
  private searchSubject = new Subject<string>();

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private adminService: UserService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private fb: FormBuilder,
    private authentificationService: AuthenticationService
  ) {
    this.filterForm = this.fb.group({
      status: [''],
      typeAccount: ['']
    });
  }

  ngAfterViewInit(): void {
    // Configuration du tri si nécessaire
    if (this.sort) {
      this.dataSource.sort = this.sort;
    }
  }

  private setupFilterListeners(): void {
    // Recherche avec debounce (300ms)
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged()
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    ).subscribe(searchText => {
      this.currentPage = 1; // Reset à la première page
      this.loadMerchants();
    });

    // Filtres avec reset de pagination
    this.filterForm.valueChanges.subscribe(() => {
      this.currentPage = 1;
      this.loadMerchants();
    });
  }

  ngOnInit(): void {
    this.currentuserRole = this.authentificationService.currentUserValue?.user.role;
    this.loadMerchants();
    this.setupFilterListeners();
  }

  loadMerchants(): void {
    this.isLoading = true;

    // Récupérer les valeurs des filtres
    const statusFilter = this.filterForm.get('status')?.value;
    const typeAccountFilter = this.filterForm.get('typeAccount')?.value;

    this.adminService.getMerchants(this.currentPage, this.itemsPerPage)
      .pipe(finalize(() => this.isLoading = false))
      .subscribe({
        next: (response: MerchantListResponse) => {
          let filteredData = response.data.items;

          // Appliquer les filtres côté client
          if (statusFilter) {
            filteredData = filteredData.filter(merchant => merchant.status === statusFilter);
          }
          if (typeAccountFilter) {
            filteredData = filteredData.filter(merchant => merchant.typeAccount === typeAccountFilter);
          }
          if (this.searchText) {
            filteredData = this.applySearchFilter(filteredData, this.searchText);
          }

          this.dataSource.data = filteredData;
          this.totalItems = filteredData.length !== response.data.items.length ?
            filteredData.length : response.data.totalItems;
          this.currentPage = response.data.page;
        },
        error: (error) => {
          console.error('Erreur chargement marchands:', error);
          this.snackBar.open('Erreur lors du chargement des marchands', 'Fermer', {
            duration: 3000,
            panelClass: ['error-snackbar']
          });
        }
      });
  }

  private applySearchFilter(merchants: MerchantItem[], searchText: string): MerchantItem[] {
    const searchLower = searchText.toLowerCase();
    return merchants.filter(merchant =>
      merchant.user.firstname.toLowerCase().includes(searchLower) ||
      merchant.user.lastname.toLowerCase().includes(searchLower) ||
      merchant.user.email.toLowerCase().includes(searchLower) ||
      merchant.user.phone?.toLowerCase().includes(searchLower) ||
      merchant.typeAccount.toLowerCase().includes(searchLower)
    );
  }

  applyFilter(value: string): void {
    this.searchText = value.trim().toLowerCase();
    this.searchSubject.next(this.searchText);
  }

  resetFilters(): void {
    this.filterForm.reset({ status: '', typeAccount: '' });
    this.searchText = '';
    this.applyFilter('');
  }

  onPageChange(e: PageEvent): void {
    this.itemsPerPage = e.pageSize;
    this.currentPage = e.pageIndex + 1;
    this.loadMerchants();
  }

  // Méthodes utilitaires
  formatUserName(merchant: MerchantItem): string {
    return `${merchant.user.firstname} ${merchant.user.lastname}`.trim();
  }

  formatWalletBalance(merchant: MerchantItem): string {
    if (!merchant) return 'N/A';
    return `${merchant.balance} XAF`;
  }

  getStableColor(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const h = hash % 360;
    return `hsl(${h}, 70%, 60%)`;
  }

  createStableAvatar(merchant: MerchantItem): { letter: string; color: string } {
    const firstLetter = merchant.user.firstname ? merchant.user.firstname.charAt(0).toUpperCase() : '?';
    return {
      letter: firstLetter,
      color: this.getStableColor(merchant.user.firstname + merchant.user.lastname)
    };
  }

  getStatusIcon(status: string): string {
    switch (status) {
      case 'ACTIVE': return 'check_circle';
      case 'SUSPENDED': return 'cancel';
      case 'PENDING': return 'schedule';
      default: return 'help';
    }
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'ACTIVE': return '#4caf50';
      case 'SUSPENDED': return '#f44336';
      case 'PENDING': return '#ff9800';
      default: return '#9e9e9e';
    }
  }

  // Actions sur les marchands
  toggleMerchantStatus(merchantId: string, currentStatus: string): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Changement de statut',
        message: `Êtes-vous sûr de vouloir ${currentStatus === 'ACTIVE' ? 'suspendre' : 'activer'} ce marchand ?`,
        confirmText: 'Confirmer',
        cancelText: 'Annuler'
      }
    });

    dialogRef.afterClosed().subscribe(confirm => {
      if (confirm) {
        this.performStatusChange(merchantId, currentStatus);
      }
    });
  }

  private performStatusChange(merchantId: string, currentStatus: string): void {
    const newStatus = currentStatus === 'ACTIVE' ? 'REFUSED' : 'ACTIVE';

    // Appeler le service pour changer le statut
    this.adminService.changeMerchantStatus(merchantId, newStatus).subscribe({
      next: () => {
        this.snackBar.open(`Statut changé à ${newStatus}`, 'Fermer', { duration: 3000 });
        this.loadMerchants();
      },
      error: (error) => {
        this.snackBar.open('Échec du changement de statut', 'Fermer', { duration: 3000 });
        console.error('Error:', error);
      }
    });

    // Pour l'instant, on simule le changement
    // this.snackBar.open(`Fonctionnalité à implémenter: Changer statut à ${newStatus}`, 'Fermer', {
    //   duration: 3000
    // });
  }

  deleteMerchant(merchantId: number): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Alerte suppression',
        message: 'Êtes-vous sûr de vouloir supprimer ce marchand ? Cette action est irréversible.',
        confirmText: 'Supprimer',
        cancelText: 'Annuler'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.performMerchantDeletion(merchantId);
      }
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private performMerchantDeletion(merchantId: number): void {
    // Appeler le service pour supprimer le marchand
    // this.adminService.deleteMerchant(merchantId).subscribe({
    //   next: () => {
    //     this.snackBar.open('Marchand supprimé avec succès', 'Fermer', {
    //       duration: 3000,
    //       panelClass: ['success-snackbar']
    //     });
    //     this.loadMerchants();
    //   },
    //   error: (err) => {
    //     this.snackBar.open('Échec de la suppression', 'Fermer', {
    //       duration: 3000,
    //       panelClass: ['error-snackbar']
    //     });
    //     console.error('Delete error:', err);
    //   }
    // });

    // Pour l'instant, on simule la suppression
    this.snackBar.open('Fonctionnalité de suppression à implémenter', 'Fermer', {
      duration: 3000
    });
  }

  // Vérification des permissions
  canEdit(): boolean {
    return !!(this.currentuserRole?.includes('SUPER_ADMIN') ||
             this.currentuserRole?.includes('SYSTEM_ADMIN') ||
             this.currentuserRole?.includes('MANAGEMENT_CONTROLLER'));
  }

  canDelete(): boolean {
    return !!(this.currentuserRole?.includes('SUPER_ADMIN') ||
             this.currentuserRole?.includes('SYSTEM_ADMIN'));
  }

  canChangeStatus(): boolean {
    return !!(this.currentuserRole?.includes('SUPER_ADMIN') ||
             this.currentuserRole?.includes('SYSTEM_ADMIN') ||
             this.currentuserRole?.includes('MANAGEMENT_CONTROLLER') ||
             this.currentuserRole?.includes('TECHNICAL_DIRECTOR'));
  }
}

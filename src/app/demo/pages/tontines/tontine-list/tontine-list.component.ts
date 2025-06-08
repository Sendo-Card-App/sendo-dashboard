import { Component, OnInit } from '@angular/core';
import { TontineService } from 'src/app/@theme/services/tontine.service';
import { Tontine, TontineResponse, TontinePagination } from 'src/app/@theme/models/index';
import { MatSnackBar } from '@angular/material/snack-bar';
import { PageEvent } from '@angular/material/paginator';
import { CommonModule, DatePipe } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { SharedModule } from 'src/app/demo/shared/shared.module';
import { Router } from '@angular/router';
// import { TontineDetailDialogComponent } from './tontine-detail-dialog/tontine-detail-dialog.component';

@Component({
  selector: 'app-tontine-list',
  templateUrl: './tontine-list.component.html',
  styleUrls: ['./tontine-list.component.scss'],
  providers: [DatePipe],
  imports: [SharedModule, CommonModule]
})
export class TontineListComponent implements OnInit {
  tontines: Tontine[] = [];
  filteredTontines: Tontine[] = []; // Nouvelle propriété pour les résultats filtrés
  isLoading = false;
  searchQuery = '';

  // Pagination
  currentPage = 1;
  itemsPerPage = 10;
  totalItems = 0;
  totalPages = 0;

  // Table columns
  displayedColumns: string[] = [
    'nom',
    'type',
    'frequence',
    'montant',
    'membres',
    'etat',
    'createdAt',
    'actions'
  ];

  constructor(
    private tontineService: TontineService,
    private snackBar: MatSnackBar,
    private datePipe: DatePipe,
    private dialog: MatDialog,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadTontines();
  }

  loadTontines(): void {
    this.isLoading = true;
    this.tontineService.getTontines(this.currentPage, this.itemsPerPage)
      .subscribe({
        next: (response: TontineResponse) => {
          this.tontines = response.data.items;
          this.filteredTontines = [...this.tontines]; // Initialise filteredTontines
          this.totalItems = response.data.totalItems;
          this.totalPages = response.data.totalPages;
          this.isLoading = false;
          this.applySearchFilter(); // Applique le filtre après chargement
        },
        error: (error) => {
          console.error('Error loading tontines:', error);
          this.snackBar.open('Erreur lors du chargement des tontines', 'Fermer', {
            duration: 3000,
            panelClass: ['error-snackbar']
          });
          this.isLoading = false;
        }
      });
  }

  // Méthode pour obtenir le nom de l'admin
  getAdminName(tontine: Tontine): string {
    const admin = tontine.membres.find(m => m.role === 'ADMIN');
    return admin ? `${admin.user.firstName} ${admin.user.lastName}` : 'Non défini';
  }

  // Méthode pour filtrer les tontines
  applySearchFilter(): void {
    if (!this.searchQuery) {
      this.filteredTontines = [...this.tontines];
      return;
    }

    const query = this.searchQuery.toLowerCase();
    this.filteredTontines = this.tontines.filter(tontine =>
      tontine.nom.toLowerCase().includes(query) ||
      tontine.description.toLowerCase().includes(query) ||
      this.getAdminName(tontine).toLowerCase().includes(query) ||
      tontine.type.toLowerCase().includes(query) ||
      tontine.frequence.toLowerCase().includes(query) ||
      tontine.montant.toString().includes(query)
    );
  }

  onSearch(): void {
    this.applySearchFilter();
  }

  onPageChange(event: PageEvent): void {
    this.currentPage = event.pageIndex + 1;
    this.itemsPerPage = event.pageSize;
    this.loadTontines();
  }

  formatDate(date: string): string {
    return this.datePipe.transform(date, 'dd/MM/yyyy') || '';
  }

  getEtatClass(etat: string): string {
    return etat === 'ACTIVE' ? 'active-state' : 'inactive-state';
  }

  getTypeClass(type: string): string {
    return type === 'FIXE' ? 'fixed-type' : 'variable-type';
  }

  viewDetails(transactionId: string): void {
    this.router.navigate(['/tontines/', transactionId]);
  }

  trackById( item: Tontine): number {
    return item.id;
  }
}

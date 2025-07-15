import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { CardService } from 'src/app/@theme/services/card.service';
import { CardInfo, CardTransaction } from 'src/app/@theme/models/card';
import { CommonModule, DatePipe } from '@angular/common';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormBuilder, FormGroup } from '@angular/forms';
import { SharedModule } from 'src/app/demo/shared/shared.module';

@Component({
  selector: 'app-card-detail-list',
  templateUrl: './card-detail-list.component.html',
  styleUrls: ['./card-detail-list.component.scss'],
  providers: [DatePipe],
  imports: [SharedModule, CommonModule],
})
export class CardDetailListComponent implements OnInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  isLoading = false;
  cardId!: number;
  searchText = '';

  // Filtres
  filterForm: FormGroup;

  // Options de filtre
  statusOptions = [
    { value: '', label: 'Tous les statuts' },
    { value: 'PENDING', label: 'En attente' },
    { value: 'COMPLETED', label: 'Complétée' },
    { value: 'FAILED', label: 'Échouée' }
  ];

  typeOptions = [
    { value: '', label: 'Tous les types' },
    { value: 'PAYMENT', label: 'Paiement' },
    { value: 'TRANSFER', label: 'Transfert' },
    { value: 'DEPOSIT', label: 'Dépôt' },
    { value: 'WITHDRAWAL', label: 'Retrait' }
  ];

  // Configuration du tableau
  displayedColumns: string[] = ['date', 'description', 'amount', 'fees', 'status', 'method'];
  dataSource = new MatTableDataSource<CardTransaction>();

  // Données brutes pour le filtrage côté client
  allTransactions: CardTransaction[] = [];
  InfoUser: CardInfo | null = null;

  // Pagination
  totalItems = 0;
  itemsPerPage = 10;
  currentPage = 0;


  constructor(
    private route: ActivatedRoute,
    private cardService: CardService,
    private datePipe: DatePipe,
    private snackBar: MatSnackBar,
    private fb: FormBuilder
  ) {
    this.filterForm = this.fb.group({
      status: [''],
      type: [''],
      startDate: [null],
      endDate: [null]
    });
  }

  ngOnInit(): void {
    this.cardId = Number(this.route.snapshot.paramMap.get('id'));
    this.loadTransactions();
  }

  loadTransactions(): void {
    this.isLoading = true;
    this.cardService.getCardTransactions(this.cardId).subscribe({
      next: (response) => {
        this.allTransactions = response.data.transactions.items;
        this.totalItems = response.data.transactions.totalItems;
        this.InfoUser = response.data.card;
        this.applyFilters();
        this.isLoading = false;

        console.log('Transactions loaded:', response.data.transactions.items);

      },
      error: (err) => {
        console.error('Error loading transactions', err);
        this.showError('Erreur lors du chargement des transactions');
        this.isLoading = false;
      }
    });
  }

  applyFilters(): void {
    let filteredData = [...this.allTransactions];

    // Appliquer les filtres du formulaire
    const filters = this.filterForm.value;

    if (filters.status) {
      filteredData = filteredData.filter(t => t.status === filters.status);
    }

    if (filters.type) {
      filteredData = filteredData.filter(t => t.type === filters.type);
    }

    if (filters.startDate) {
      const startDate = new Date(filters.startDate);
      filteredData = filteredData.filter(t => new Date(t.createdAt) >= startDate);
    }

    if (filters.endDate) {
      const endDate = new Date(filters.endDate);
      endDate.setHours(23, 59, 59, 999); // Inclure toute la journée
      filteredData = filteredData.filter(t => new Date(t.createdAt) <= endDate);
    }

    // Appliquer la pagination
    const startIndex = this.currentPage * this.itemsPerPage;
    const paginatedData = filteredData.slice(startIndex, startIndex + this.itemsPerPage);

    this.dataSource.data = paginatedData;
    this.totalItems = filteredData.length;
  }

  resetFilters(): void {
    this.filterForm.reset({
      status: '',
      type: '',
      startDate: null,
      endDate: null
    });
    this.currentPage = 0;
    this.applyFilters();
  }

  onPageChange(event: PageEvent): void {
    this.currentPage = event.pageIndex;
    this.itemsPerPage = event.pageSize;
    this.applyFilters();
  }

  formatDate(date: string): string {
    return this.datePipe.transform(date, 'medium') || '';
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  }

  formatStatus(status: string): string {
    const statusMap: Record<string, string> = {
      'PENDING': 'En attente',
      'COMPLETED': 'Complétée',
      'FAILED': 'Échouée'
    };
    return statusMap[status] || status;
  }

  getStatusClass(status: string): string {
    return `status-${status.toLowerCase()}`;
  }

  formatType(type: string): string {
    const typeMap: Record<string, string> = {
      'PAYMENT': 'Paiement',
      'TRANSFER': 'Transfert',
      'DEPOSIT': 'Dépôt',
      'WITHDRAWAL': 'Retrait'
    };
    return typeMap[type] || type;
  }

  showError(message: string): void {
    this.snackBar.open(message, 'Fermer', { duration: 3000 });
  }

  goBack(): void {
    window.history.back();
  }
}

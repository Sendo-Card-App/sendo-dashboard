// tr-all-transaction.component.ts
import { Component, OnInit, ViewChild } from '@angular/core';
import { TransactionsService } from 'src/app/@theme/services/transactions.service';
import { Transactions } from 'src/app/@theme/models/index';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { FormBuilder } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { SharedModule } from 'src/app/demo/shared/shared.module';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-tr-all-transaction',
  templateUrl: './tr-alltransaction.component.html',
  imports: [CommonModule, SharedModule],
  styleUrls: ['./tr-alltransaction.component.scss']
})
export class TrAllTransactionComponent implements OnInit {
  displayedColumns: string[] = ['transactionId','username', 'amount', 'type', 'status', 'method', 'createdAt', 'actions'];
  dataSource = new MatTableDataSource<Transactions>();
  allTransactions: Transactions[] = [];
  isLoading = false;

  filterForm = this.fb.group({
    search: [''],
    status: [''],
    type: [''],
    method: [''],
    provider: [''],
    minAmount: [''],
    maxAmount: ['']
  });

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private transactionsService: TransactionsService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.loadAllTransactions();
    this.setupFilterListeners();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  loadAllTransactions(): void {
    this.isLoading = true;
    this.transactionsService.getTransactions().subscribe({
      next: (response) => {
        console.log('Transactions loaded:', response);
        this.allTransactions = response.data.items;
        this.dataSource.data = this.allTransactions;
        this.isLoading = false;

        console.log('All transactions:', this.allTransactions);
        console.log('Data source:', this.dataSource.data);
        this.applyFilters(); // Applique les filtres initiaux
      },
      error: (error) => {
        console.error('Error loading transactions:', error);
        this.isLoading = false;
      }
    });
  }

  setupFilterListeners(): void {
    this.filterForm.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe(() => {
        this.applyFilters();
      });
  }

  applyFilters(): void {
    const filters = this.filterForm.value;
    let filteredData = [...this.allTransactions];

    // Filtre de recherche
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filteredData = filteredData.filter(transaction=>
        transaction.transactionId.toLowerCase().includes(searchTerm) ||
        transaction.amount.toString().includes(searchTerm) ||
        (transaction.description?.toLowerCase().includes(searchTerm) || false
      ));
    }

    // Filtres simples (string)
    if (filters.status) {
      filteredData = filteredData.filter(transaction => transaction.status === filters.status);
    }

    if (filters.type) {
      filteredData = filteredData.filter(transaction => transaction.type === filters.type);
    }

    if (filters.method) {
      filteredData = filteredData.filter(transaction => transaction.method === filters.method);
    }

    if (filters.provider) {
      filteredData = filteredData.filter(transaction => transaction.provider === filters.provider);
    }

    // Filtres numériques avec vérification de null/undefined
    if (filters.minAmount !== null && filters.minAmount !== undefined && filters.minAmount !== '') {
      const minAmount = Number(filters.minAmount);
      if (!isNaN(minAmount)) {
        filteredData = filteredData.filter(transaction => transaction.amount >= minAmount);
      }
    }

    if (filters.maxAmount !== null && filters.maxAmount !== undefined && filters.maxAmount !== '') {
      const maxAmount = Number(filters.maxAmount);
      if (!isNaN(maxAmount)) {
        filteredData = filteredData.filter(transaction => transaction.amount <= maxAmount);
      }
    }

    this.dataSource.data = filteredData;

    if (this.paginator) {
      this.paginator.firstPage();
    }
  }

  resetFilters(): void {
    this.filterForm.reset();
    this.dataSource.data = this.allTransactions;
  }

  // Fonctions utilitaires pour l'affichage
  formatType(type: string): string {
    return type ? type.toLowerCase().replace('_', ' ') : '';
  }

  formatStatus(status: string): string {
    return status ? status.charAt(0) + status.slice(1).toLowerCase() : '';
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'COMPLETED': return 'status-completed';
      case 'PENDING': return 'status-pending';
      case 'FAILED': return 'status-failed';
      case 'BLOCKED': return 'status-failed';
      default: return '';
    }
  }
}

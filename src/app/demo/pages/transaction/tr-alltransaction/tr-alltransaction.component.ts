import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { TransactionsService } from 'src/app/@theme/services/transactions.service';
import { Transactions, TransactionType, TransactionStatus } from 'src/app/@theme/models/index';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { FormBuilder, FormGroup } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { SharedModule } from 'src/app/demo/shared/shared.module';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { DatePipe } from '@angular/common';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';

@Component({
  selector: 'app-tr-all-transaction',
  templateUrl: './tr-alltransaction.component.html',
  imports: [CommonModule, SharedModule],
  styleUrls: ['./tr-alltransaction.component.scss'],
  providers: [DatePipe]
})
export class TrAllTransactionComponent implements OnInit, AfterViewInit {
  displayedColumns: string[] = ['transactionId', 'username', 'amount', 'type', 'status', 'method', 'createdAt', 'actions'];
  dataSource = new MatTableDataSource<Transactions>([]);
  isLoading = false;
  totalItems = 0;
  currentPage = 0; // Changé à 0 pour correspondre à l'index Material
  itemsPerPage = 10;
  currentSort: { active: string; direction: 'asc' | 'desc' | '' } = { active: '', direction: '' };

  filterForm: FormGroup;

  // Options for filters
  statusOptions = [
    { value: '', label: 'All' },
    { value: 'PENDING', label: 'Pending' },
    { value: 'COMPLETED', label: 'Completed' },
    { value: 'FAILED', label: 'Failed' }
  ];

  typeOptions = [
    { value: '', label: 'All' },
    { value: 'DEPOSIT', label: 'Deposit' },
    { value: 'WITHDRAWAL', label: 'Withdrawal' },
    { value: 'TRANSFER', label: 'Transfer' }
  ];

  methodOptions = [
    { value: '', label: 'All' },
    { value: 'MOBILE_MONEY', label: 'Mobile Money' },
    { value: 'BANK_TRANSFER', label: 'Bank Transfer' }
  ];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private transactionsService: TransactionsService,
    private fb: FormBuilder,
    private router: Router,
    private datePipe: DatePipe
  ) {
    this.filterForm = this.fb.group({
      search: [''],
      status: [''],
      type: [''],
      method: [''],
      minAmount: [''],
      maxAmount: [''],
      startDate: [''],
      endDate: ['']
    });
  }

  ngOnInit(): void {
    this.loadTransactions();
    this.setupFilterListeners();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;

    this.sort.sortChange.subscribe(sort => {
      this.currentSort.active = sort.active;
      this.currentSort.direction = sort.direction || 'asc'; // Valeur par défaut si vide
      this.loadTransactions();
    });
  }

  loadTransactions(): void {
    this.isLoading = true;

    const formValues = this.filterForm.value;
    const startDate = formValues.startDate ? this.datePipe.transform(formValues.startDate, 'yyyy-MM-dd') : '';
    const endDate = formValues.endDate ? this.datePipe.transform(formValues.endDate, 'yyyy-MM-dd') : '';

    // Note: +1 car l'API attend probablement page=1 pour la première page
    const apiPage = this.currentPage + 1;

    this.transactionsService.getTransactions(
      apiPage,
      this.itemsPerPage,
      formValues.type as TransactionType,
      formValues.status as TransactionStatus,
      formValues.method as 'MOBILE_MONEY' | 'BANK_TRANSFER',
      startDate || undefined,
      endDate || undefined
    ).subscribe({
      next: (response) => {
        this.dataSource.data = response.data.items;
        this.totalItems = response.data.totalItems; // Assurez-vous que c'est le bon champ
        this.isLoading = false;

        // Synchronisez le paginator après le chargement
        if (this.paginator) {
          this.paginator.length = this.totalItems;
          this.paginator.pageIndex = this.currentPage;
        }
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
        this.currentPage = 0; // Réinitialise à la première page
        if (this.paginator) {
          this.paginator.firstPage();
        }
        this.loadTransactions();
      });
  }

  onPageChange(event: PageEvent): void {
    this.currentPage = event.pageIndex;
    this.itemsPerPage = event.pageSize;
    this.loadTransactions();

    // Optionnel: Faites défiler vers le haut pour une meilleure UX
    window.scrollTo(0, 0);
  }

  resetFilters(): void {
    this.filterForm.reset();
    this.currentPage = 0;
    if (this.paginator) {
      this.paginator.firstPage();
    }
    this.loadTransactions();
  }

  onDateChange(type: 'startDate' | 'endDate', event: MatDatepickerInputEvent<Date>): void {
    this.filterForm.get(type)?.setValue(event.value);
    this.currentPage = 0;
    this.loadTransactions();
  }

  formatType(type: string): string {
    return type ? type.toLowerCase().replace('_', ' ') : '';
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

  viewDetails(transactionId: string): void {
    this.router.navigate(['/transactions', transactionId]);
  }
}

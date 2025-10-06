import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { FormBuilder, FormGroup } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { SharedExpenseService } from 'src/app/@theme/services/sharedexpenses.service';
import { SharedExpense } from 'src/app/@theme/models/index';
import { CommonModule, DatePipe } from '@angular/common';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SharedModule } from 'src/app/demo/shared/shared.module';
import { Router } from '@angular/router';

@Component({
  selector: 'app-shared-expense-list',
  templateUrl: './shared-expense-list.component.html',
  styleUrls: ['./shared-expense-list.component.scss'],
  providers: [DatePipe],
  imports: [CommonModule,SharedModule]
})
export class SharedExpenseListComponent implements OnInit, AfterViewInit {
  displayedColumns: string[] = ['id', 'description', 'totalAmount', 'initiatorPart', 'limitDate', 'status', 'actions'];
  dataSource = new MatTableDataSource<SharedExpense>();
  isLoading = false;
  totalItems = 0;
  currentPage = 1;
  itemsPerPage = 10;

  filterForm: FormGroup;
  statusOptions = [
    { value: '', label: 'Tous' },
    { value: 'PENDING', label: 'En attente' },
    { value: 'COMPLETED', label: 'Complété' },
    { value: 'CANCELLED', label: 'Annulé' }
  ];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private sharedExpenseService: SharedExpenseService,
    private fb: FormBuilder,
    private datePipe: DatePipe,
    private snackBar: MatSnackBar,
    private router: Router
  ) {
    this.filterForm = this.fb.group({
      status: [''],
      startDate: [''],
      endDate: ['']
    });
  }

  ngOnInit(): void {
    this.loadSharedExpenses();
    this.setupFilterListeners();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  loadSharedExpenses(): void {
    this.isLoading = true;
    const formValues = this.filterForm.value;

    this.sharedExpenseService.getSharedExpenses({
      page: this.currentPage,
      limit: this.itemsPerPage,
      status: formValues.status || undefined,
      startDate: formValues.startDate ? this.datePipe.transform(formValues.startDate, 'yyyy-MM-dd')! : undefined,
      endDate: formValues.endDate ? this.datePipe.transform(formValues.endDate, 'yyyy-MM-dd')! : undefined
    }).subscribe({
      next: (response) => {
        this.dataSource.data = response.data.items;
        this.totalItems = response.data.totalItems; // Adaptez selon votre API
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading shared expenses:', error);
        this.isLoading = false;
        this.snackBar.open('Erreur lors du chargement des dépenses partagées', 'Fermer', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  setupFilterListeners(): void {
    this.filterForm.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe(() => {
        this.currentPage = 1;
        this.loadSharedExpenses();
      });
  }

  onPageChange(event: PageEvent): void {
    this.currentPage = event.pageIndex + 1;
    this.itemsPerPage = event.pageSize;
    this.loadSharedExpenses();
  }

  resetFilters(): void {
    this.filterForm.reset();
    this.currentPage = 1;
    this.loadSharedExpenses();
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'PENDING': return 'status-pending';
      case 'COMPLETED': return 'status-completed';
      case 'CANCELLED': return 'status-cancelled';
      default: return '';
    }
  }
  viewDetails(transactionId: string): void {
    this.router.navigate(['/shared-expenses/', transactionId]);
  }

  formatDate(dateString: string): string {
    return this.datePipe.transform(dateString, 'dd/MM/yyyy') || '';
  }
}

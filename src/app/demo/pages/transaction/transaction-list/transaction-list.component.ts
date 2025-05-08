import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { TransactionsService } from 'src/app/@theme/services/transactions.service';
import { Transactions } from 'src/app/@theme/models';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { CommonModule, DatePipe } from '@angular/common';
import { SharedModule } from 'src/app/demo/shared/shared.module';

@Component({
  selector: 'app-transaction-list',
  templateUrl: './transaction-list.component.html',
  styleUrls: ['./transaction-list.component.scss'],
  providers: [DatePipe],
  imports: [
      CommonModule,
      SharedModule
    ],
})
export class TransactionListComponent implements OnInit {
  displayedColumns: string[] = [
    'username',
    'transactionId',
    'amount',
    'type',
    'status',
    'method',
    'createdAt',
    'actions'
  ];
  dataSource = new MatTableDataSource<Transactions>();
  isLoading = false;
  totalItems = 0;
  currentPage = 1;
  itemsPerPage = 10;
  userId: number;

  filterForm: FormGroup;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  constructor(
    private route: ActivatedRoute,
    private transactionsService: TransactionsService,
    private fb: FormBuilder,
    private datePipe: DatePipe,
    private router: Router,
  ) {
    this.filterForm = this.fb.group({
      search: [''],
      status: [''],
      type: [''],
      method: [''],
      provider: [''],
      minAmount: [''],
      maxAmount: [''],
      startDate: [''],
      endDate: ['']
    });
  }

  ngOnInit(): void {

    this.route.paramMap.subscribe(params => {
      const id = params.get('userId');
      if (id) {
        this.userId = +id;
      } else {
        this.router.navigate(['/transactions']);
      }
    });
    this.loadTransactions();

    this.filterForm.valueChanges
      .pipe(
        debounceTime(500),
        distinctUntilChanged()
      )
      .subscribe(() => {
        this.currentPage = 1;
        this.loadTransactions();
      });
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  loadTransactions(): void {
    this.isLoading = true;
    const formValue = this.filterForm.value;

    // On récupère la date en string ou undefined (jamais null)
    const startDate = formValue.startDate
      ? (this.datePipe.transform(new Date(formValue.startDate), 'yyyy-MM-dd') ?? undefined)
      : undefined;

    const endDate = formValue.endDate
      ? (this.datePipe.transform(new Date(formValue.endDate), 'yyyy-MM-dd')   ?? undefined)
      : undefined;

    this.transactionsService.getUserTransactions(
      this.userId,
      this.currentPage,
      this.itemsPerPage,
      formValue.type   || undefined,
      formValue.status || undefined,
      formValue.method || undefined,
      startDate,
      endDate
    ).subscribe({
      next: (response) => {
        this.dataSource.data = response.data.items;
        this.totalItems       = response.data.totalItems;
        this.isLoading        = false;
      },
      error: (error) => {
        console.error('Error loading transactions:', error);
        this.isLoading = false;
      }
    });
  }


  onPageChange(event: PageEvent): void {
    this.currentPage = event.pageIndex + 1;
    this.itemsPerPage = event.pageSize;
    this.loadTransactions();
  }

  resetFilters(): void {
    this.filterForm.reset();
    this.currentPage = 1;
    this.loadTransactions();
  }

  viewDetails(): void {
    // Implémentez la navigation vers la page de détail
  }

  getStatusClass(status: string): string {
    return `status-${status.toLowerCase()}`;
  }

  formatType(type: string): string {
    return type.toLowerCase().replace('_', ' ');
  }
}

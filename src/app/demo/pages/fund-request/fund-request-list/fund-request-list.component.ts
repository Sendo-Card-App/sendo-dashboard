import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { FormBuilder, FormGroup } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { FundRequestService } from 'src/app/@theme/services/fundrequest.service';
import { FundRequest, FundRequestStatus } from 'src/app/@theme/models/index';
import { CommonModule, DatePipe } from '@angular/common';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SharedModule } from 'src/app/demo/shared/shared.module';
import { Router } from '@angular/router';

@Component({
  selector: 'app-fund-request-list',
  templateUrl: './fund-request-list.component.html',
  styleUrls: ['./fund-request-list.component.scss'],
  providers: [DatePipe],
  imports: [CommonModule,SharedModule]
})
export class FundRequestListComponent implements OnInit {
  displayedColumns: string[] = ['reference', 'amount', 'description', 'status', 'deadline', 'recipients', 'actions'];
  dataSource = new MatTableDataSource<FundRequest>();
  isLoading = false;
  totalItems = 0;
  currentPage = 1;
  itemsPerPage = 10;

  filterForm: FormGroup;
  statusOptions = [
    { value: '', label: 'Tous' },
    { value: 'PENDING', label: 'En attente' },
    { value: 'PARTIALLY_FUNDED', label: 'Partiellement financé' },
    { value: 'FULLY_FUNDED', label: 'Totalement financé' },
    { value: 'CANCELLED', label: 'Annulé' }
  ];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private fundRequestService: FundRequestService,
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
    this.loadFundRequests();
    this.setupFilterListeners();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  loadFundRequests(): void {
    this.isLoading = true;
    const formValues = this.filterForm.value;

    const params = {
      page: this.currentPage,
      limit: this.itemsPerPage,
      status: formValues.status || undefined,
      startDate: formValues.startDate ? this.datePipe.transform(formValues.startDate, 'yyyy-MM-dd')! : undefined,
      endDate: formValues.endDate ? this.datePipe.transform(formValues.endDate, 'yyyy-MM-dd')! : undefined
    };

    this.fundRequestService.getFundRequests(params).subscribe({
      next: (response) => {
        this.dataSource.data = response.data.items;
        this.totalItems = response.data.totalItems;
        this.isLoading = false;
        console.log('Fund requests loaded:', response.data.items[1]);
      },
      error: (error) => {
        console.error('Error loading fund requests:', error);
        this.isLoading = false;
        this.snackBar.open('Erreur lors du chargement des demandes de fonds', 'Fermer', {
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
        this.loadFundRequests();
      });
  }

  onPageChange(event: PageEvent): void {
    this.currentPage = event.pageIndex + 1;
    this.itemsPerPage = event.pageSize;
    this.loadFundRequests();
  }

  resetFilters(): void {
    this.filterForm.reset();
    this.currentPage = 1;
    this.loadFundRequests();
  }

  isDeadlinePassed(deadline: string): boolean {
    if (!deadline) return false;
    const deadlineDate = new Date(deadline);
    const today = new Date();
    return deadlineDate < today;
  }

  getStatusClass(status: FundRequestStatus): string {
    switch (status) {
      case 'PENDING': return 'status-pending';
      case 'PARTIALLY_FUNDED': return 'status-partial';
      case 'FULLY_FUNDED': return 'status-completed';
      case 'CANCELLED': return 'status-cancelled';
      default: return '';
    }
  }

  formatDate(dateString: string): string {
    return this.datePipe.transform(dateString, 'dd/MM/yyyy') || '';
  }

  formatDateTime(dateString: string): string {
    return this.datePipe.transform(dateString, 'dd/MM/yyyy HH:mm') || '';
  }

  getRecipientsCount(recipients: []): string {
    if (!recipients || recipients.length === 0) {
      return 'Aucun contact';
    }
    return `${recipients.length} contact${recipients.length > 1 ? 's' : ''}`;
  }
  viewDetails(transactionId: string): void {
    this.router.navigate(['/fund-requests/', transactionId]);
  }
}

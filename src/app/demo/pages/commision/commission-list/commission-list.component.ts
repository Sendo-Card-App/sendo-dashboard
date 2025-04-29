// commission-list.component.ts
import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { AdminService } from '../../../../@theme/services/admin.service';
import { CommonModule, formatDate } from '@angular/common';
import { SharedModule } from 'src/app/demo/shared/shared.module';

@Component({
  selector: 'app-commission-list',
  templateUrl: './commission-list.component.html',
  styleUrls: ['./commission-list.component.scss'],
  imports: [CommonModule, SharedModule]
})
export class CommissionListComponent implements OnInit, AfterViewInit {
  filterForm: FormGroup;
  isLoading = false;
  totalFees = 0;
  averageFees = 0;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  feesByType: any[] = [];

  // Table configuration
  displayedColumns: string[] = ['transactionId', 'amount', 'sendoFees', 'totalAmount', 'type', 'status', 'createdAt'];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  dataSource = new MatTableDataSource<any>();
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  // Filter options
  typeOptions = [
    { value: '', label: 'Tous les types' },
    { value: 'DEPOSIT', label: 'Dépôt' },
    { value: 'WITHDRAWAL', label: 'Retrait' },
    { value: 'PAYMENT', label: 'Paiement' },
    { value: 'TONTINE_PAYMENT', label: 'Paiement Tontine' },
    { value: 'VIEW_CARD_DETAILS', label: 'Vue des détails de carte' }
  ];

  statusOptions = [
    { value: '', label: 'Tous les statuts' },
    { value: 'COMPLETED', label: 'Complété' },
    { value: 'FAILED', label: 'Échoué' },
    { value: 'PENDING', label: 'En attente' }
  ];

  constructor(
    private fb: FormBuilder,
    private commissionService: AdminService
  ) {
    this.filterForm = this.fb.group({
      startDate: [''],
      endDate: [''],
      type: [''],
      status: ['']
    });
  }

  ngOnInit(): void {
    this.loadCommissions();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  loadCommissions(): void {
    this.isLoading = true;
    const formValue = this.filterForm.value;

    // Format dates if provided
    const startDate = formValue.startDate ?
      formatDate(formValue.startDate, 'yyyy-MM-dd', 'en-US') : '';
    const endDate = formValue.endDate ?
      formatDate(formValue.endDate, 'yyyy-MM-dd', 'en-US') : '';

    this.commissionService.getCommissions(
      startDate,
      endDate,
      formValue.type
    ).subscribe({
      next: (response) => {
        if (response.status === 200) {
          this.totalFees = response.data.totalFees;
          this.averageFees = response.data.averageFees;
          this.feesByType = response.data.feesByType;
          this.dataSource.data = response.data.recentFees;

          // Apply status filter if specified
          if (formValue.status) {
            this.dataSource.data = this.dataSource.data.filter(
              item => item.status === formValue.status
            );
          }
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading commissions:', error);
        this.isLoading = false;
      }
    });
  }

  resetFilters(): void {
    this.filterForm.reset({
      startDate: '',
      endDate: '',
      type: '',
      status: ''
    });
    this.loadCommissions();
  }

  applyFilters(): void {
    this.loadCommissions();
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'COMPLETED':
        return 'status-completed';
      case 'FAILED':
        return 'status-failed';
      case 'PENDING':
        return 'status-pending';
      default:
        return '';
    }
  }

  formatDate(date: string): string {
    return formatDate(date, 'dd/MM/yyyy HH:mm', 'en-US');
  }

  // Ajoutez ces méthodes utilitaires dans votre composant
getTypeLabel(type: string): string {
  const typeMap: { [key: string]: string } = {
    'DEPOSIT': 'Dépôt',
    'WITHDRAWAL': 'Retrait',
    'PAYMENT': 'Paiement',
    'TONTINE_PAYMENT': 'Paiement Tontine',
    'VIEW_CARD_DETAILS': 'Vue détails carte'
  };
  return typeMap[type] || type;
}

getStatusLabel(status: string): string {
  const statusMap: { [key: string]: string } = {
    'COMPLETED': 'Complété',
    'FAILED': 'Échoué',
    'PENDING': 'En attente'
  };
  return statusMap[status] || status;
}
}

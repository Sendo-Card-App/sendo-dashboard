import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { KycService } from 'src/app/@theme/services/kyc.service';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { SharedModule } from 'src/app/demo/shared/shared.module';

@Component({
  selector: 'app-kyc-all',
  templateUrl: './kyc-all.component.html',
  styleUrls: ['./kyc-all.component.scss'],
  imports: [CommonModule, SharedModule],
})
export class KycAllComponent implements OnInit {
  displayedColumns: string[] = ['user', 'type', 'status', 'createdAt', 'actions'];
  dataSource = new MatTableDataSource();
  isLoading = false;
  totalItems = 0;
  currentPage = 1;
  itemsPerPage = 10;

  filterForm: FormGroup;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private kycService: KycService,
    private fb: FormBuilder
  ) {
    this.filterForm = this.fb.group({
      search: [''],
      status: [''],
      type: ['']
    });
  }

  ngOnInit(): void {
    this.loadKycDocuments();

    this.filterForm.valueChanges
      .pipe(
        debounceTime(500),
        distinctUntilChanged()
      )
      .subscribe(() => {
        this.currentPage = 1;
        this.loadKycDocuments();
      });
  }

  loadKycDocuments(): void {
    this.isLoading = true;
    const { status } = this.filterForm.value;

    this.kycService.getAllKyc(
      this.currentPage,
      this.itemsPerPage,
      status
    ).subscribe({
      next: (response) => {
        this.dataSource.data = response.data.items;
        this.totalItems = response.data.totalItems;
        this.isLoading = false;
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Error loading KYC documents:', err);
      }
    });
  }

  onPageChange(event: PageEvent): void {
    this.currentPage = event.pageIndex + 1;
    this.itemsPerPage = event.pageSize;
    this.loadKycDocuments();
  }

  resetFilters(): void {
    this.filterForm.reset({
      search: '',
      status: '',
      type: ''
    });
    this.currentPage = 1;
    this.loadKycDocuments();
  }

  formatType(type: string): string {
    const types: { [key: string]: string } = {
      'ID_PROOF': 'Pièce d\'identité',
      'ADDRESS_PROOF': 'Justificatif de domicile',
      'SELFIE': 'Selfie',
      'NIU_PROOF': 'Justificatif NIU'
    };
    return types[type] || type;
  }

  formatStatus(status: string): string {
    return status.charAt(0) + status.slice(1).toLowerCase();
  }

  getStatusClass(status: string): string {
    return `status-${status.toLowerCase()}`;
  }
}

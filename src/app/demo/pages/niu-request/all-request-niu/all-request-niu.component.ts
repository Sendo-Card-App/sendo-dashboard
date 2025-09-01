import { Component, OnDestroy, OnInit, Output, EventEmitter, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { RequestsListResponse, RequestItem, RequestStatus } from 'src/app/@theme/models';
import { NiuService } from 'src/app/@theme/services/niu.service';
import { CommonModule } from '@angular/common';
import { SharedModule } from 'src/app/demo/shared/shared.module';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthenticationService } from 'src/app/@theme/services/authentication.service';

@Component({
  selector: 'app-all-request-niu',
  templateUrl: './all-request-niu.component.html',
  styleUrls: ['./all-request-niu.component.scss'],
  imports: [CommonModule, SharedModule,FormsModule,ReactiveFormsModule],
  standalone: true
})
export class AllRequestNiuComponent implements OnInit, OnDestroy {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @Output() HeaderBlur = new EventEmitter<void>();


  filterForm: FormGroup;
  rejectionForm: FormGroup;
  selectedFile: File | null = null;
  isLoading = false;
  dataSource = new MatTableDataSource<RequestItem>();
  displayedColumns: string[] = ['id', 'user', 'description', 'status', 'createdAt', 'actions'];
  totalItems = 0;
  itemsPerPage = 10;
  currentPage = 1;
  private destroy$ = new Subject<void>();
  direction: string = 'ltr';
  currentuserRole: string | undefined;

  currentRequest: RequestItem | null = null;
  selectedAction: 'approve' | 'reject' | null = null;
  isUpdatingStatus = false;
  private intervalId!: ReturnType<typeof setInterval>;

  constructor(
    private fb: FormBuilder,
    private requestService: NiuService,
    private snackBar: MatSnackBar,
    private authentificationService: AuthenticationService
  ) {
    this.filterForm = this.fb.group({
      search: [''],
      status: ['UNPROCESSED'],
      type: ['NIU_REQUEST']
    });

    this.rejectionForm = this.fb.group({
      reason: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.currentuserRole = this.authentificationService.currentUserValue?.user.role;
    this.setupFormListeners();
    this.loadRequests();

    this.intervalId = setInterval(() => {
      this.loadRequests();
    }, 30000);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }



  private setupFormListeners(): void {
    this.filterForm.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        takeUntil(this.destroy$))
      .subscribe(() => {
        this.currentPage = 1;
        if (this.paginator) {
          this.paginator.firstPage();
        }
        this.loadRequests();
      });
  }

  loadRequests(): void {
    this.isLoading = true;
    this.dataSource.data = [];

    const searchValue = this.filterForm.get('search')?.value;
    const statusValue = this.filterForm.get('status')?.value;
    const typeValue = this.filterForm.get('type')?.value;

    this.requestService.getRequestsList(
      this.currentPage,
      this.itemsPerPage,
      typeValue,
      statusValue,
      searchValue
    ).subscribe({
      next: (response: RequestsListResponse) => {
        this.dataSource.data = response.data.items;
        this.totalItems = response.data.total;
        this.isLoading = false;
        console.log('request : ', this.dataSource.data)
      },
      error: (error) => {
        console.error('Error loading requests:', error);
        this.isLoading = false;
      }
    });
  }

  onPageChange(event: PageEvent): void {
    this.currentPage = event.pageIndex + 1;
    this.itemsPerPage = event.pageSize;
    this.loadRequests();
  }

  resetFilters(): void {
    this.filterForm.patchValue({
      search: '',
      status: 'UNPROCESSED',
      type: 'NIU_REQUEST'
    }, { emitEvent: false });
    this.currentPage = 1;
    if (this.paginator) {
      this.paginator.firstPage();
    }
    this.loadRequests();
  }

  getStatusClass(status: RequestStatus): string {
    switch (status) {
      case 'UNPROCESSED': return 'status-unprocessed';
      case 'PROCESSED': return 'status-processed';
      case 'REJECTED': return 'status-rejected';
      default: return '';
    }
  }

  openDetails(request: RequestItem): void {
    this.currentRequest = request;
    this.selectedAction = null;
    this.selectedFile = null;
    this.rejectionForm.reset();
    this.HeaderBlur.emit();
  }

  closeDetails(): void {
    this.currentRequest = null;
    this.selectedAction = null;
    this.HeaderBlur.emit();
  }

  onActionChange(): void {
    this.selectedFile = null;
    this.rejectionForm.reset();
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
    }
  }

  updateRequestStatus(): void {
    if (!this.currentRequest || this.isUpdatingStatus) return;

    this.isUpdatingStatus = true;
    let status: RequestStatus;
    let reason: string | undefined;
    let file: File | undefined;

    

    if (this.selectedAction === 'approve') {
      status = 'PROCESSED';
      if (!this.selectedFile) {
        this.snackBar.open('Veuillez sélectionner un fichier', 'Fermer', { duration: 3000 });
        this.isUpdatingStatus = false;
        return;
      }

      file = this.selectedFile;
      console.log('Selected file:', file);
      console.log('Selected status:', status);
    } else if (this.selectedAction === 'reject') {
      status = 'REJECTED';
      if (this.rejectionForm.invalid) {
        this.snackBar.open('Veuillez saisir une raison de rejet', 'Fermer', { duration: 3000 });
        this.isUpdatingStatus = false;
        return;
      }
      reason = this.rejectionForm.get('reason')?.value;
    } else {
      this.isUpdatingStatus = false;
      return;
    }

    this.requestService.updateRequestStatus(
      this.currentRequest.id,
      status,
      reason,
      file
    ).subscribe({
      next: () => {
        this.snackBar.open('Statut mis à jour avec succès', 'Fermer', {
          duration: 3000,
          panelClass: ['success-snackbar']
        });
        this.currentRequest!.status = status;
        this.updateRequestInList(this.currentRequest!);
        this.closeDetails();
        this.isUpdatingStatus = false;
      },
      error: (err) => {
        this.snackBar.open('Échec de la mise à jour du statut', 'Fermer', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
        console.error('Error updating request status:', err.message);
        this.isUpdatingStatus = false;
      }
    });
  }

  private updateRequestInList(updatedRequest: RequestItem): void {
    const index = this.dataSource.data.findIndex(r => r.id === updatedRequest.id);
    if (index !== -1) {
      this.dataSource.data[index] = updatedRequest;
      this.dataSource._updateChangeSubscription();
    }
  }
}

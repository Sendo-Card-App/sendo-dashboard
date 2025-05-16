import { Component, OnDestroy, OnInit, output, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { RequestsListResponse, RequestItem, RequestStatus, BaseResponse } from 'src/app/@theme/models';
import { NiuService } from 'src/app/@theme/services/niu.service';
import { CommonModule } from '@angular/common';
import { SharedModule } from 'src/app/demo/shared/shared.module';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-all-request-niu',
  templateUrl: './all-request-niu.component.html',
  styleUrls: ['./all-request-niu.component.scss'],
  imports: [
        CommonModule,
        SharedModule
      ],
})
export class AllRequestNiuComponent implements OnInit, OnDestroy {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  filterForm: FormGroup;
  isLoading = false;
  dataSource = new MatTableDataSource<RequestItem>();
  displayedColumns: string[] = ['id', 'user', 'description', 'status', 'createdAt', 'actions'];
  totalItems = 0;
  itemsPerPage = 10;
  currentPage = 1;
  private destroy$ = new Subject<void>();
  readonly HeaderBlur = output();
   direction: string = 'ltr';

   currentRequest: RequestItem | null = null;
  statusForm: FormGroup;
  isUpdatingStatus = false;

  constructor(
    private fb: FormBuilder,
    private requestService: NiuService,
    private snackBar: MatSnackBar
  ) {
      this.filterForm = this.fb.group({
    search: [''],
    status: ['UNPROCESSED'],
    type: ['NIU_REQUEST']
  });

  // Ajoutez cette initialisation
  this.statusForm = this.fb.group({
    newStatus: ['PROCESSED']
  });
  }

  ngOnInit(): void {
    this.setupFormListeners();
    this.loadRequests();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private setupFormListeners(): void {
    // Écoute les changements avec debounce pour éviter trop de requêtes
    this.filterForm.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
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
      searchValue // Ajout du paramètre de recherche
    ).subscribe({
      next: (response: RequestsListResponse) => {
        this.dataSource.data = response.data.items;
        this.totalItems = response.data.total;
        this.isLoading = false;
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
    }, { emitEvent: false }); // emitEvent: false pour éviter de déclencher valueChanges

    this.currentPage = 1;
    if (this.paginator) {
      this.paginator.firstPage();
    }
    this.loadRequests();
  }

 getStatusClass(status: RequestStatus): string {
  switch (status) {
    case 'UNPROCESSED': return 'status-unprocessed';
    case 'PROCESSED': return 'status-processed'; // Changé de 'APPROVED' à 'PROCESSED'
    case 'REJECTED': return 'status-rejected';
    default: return '';
  }
}

  viewDetails(requestId: number): void {
    // Implémentez la navigation vers les détails de la demande
    console.log('View details for request:', requestId);
  }

 // Pour ouvrir le drawer
openDetails(request: RequestItem): void {
  this.currentRequest = request;
  this.statusForm.patchValue({
    newStatus: request.status === 'UNPROCESSED' ? 'PROCESSED' : request.status
  });
  this.HeaderBlur.emit();
}

// Pour fermer le drawer
closeDetails(): void {
  this.currentRequest = null;
  this.HeaderBlur.emit();
}

  updateRequestStatus(): void {
    if (!this.currentRequest || this.isUpdatingStatus) return;

    const newStatus = this.statusForm.get('newStatus')?.value as RequestStatus;
    this.isUpdatingStatus = true;

    this.requestService.updateRequestStatus(this.currentRequest.id, newStatus)
      .subscribe({
        next: () => {
          this.snackBar.open('Statut mis à jour avec succès', 'Fermer', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });

          // Mettre à jour la requête locale
          if (this.currentRequest) {
            this.currentRequest.status = newStatus;
            this.updateRequestInList(this.currentRequest);
          }

          this.isUpdatingStatus = false;
        },
        error: () => {
          this.snackBar.open('Échec de la mise à jour du statut', 'Fermer', {
            duration: 3000,
            panelClass: ['error-snackbar']
          });
          this.isUpdatingStatus = false;
        }
      });
  }
   private updateRequestInList(updatedRequest: RequestItem): void {
    const index = this.dataSource.data.findIndex(r => r.id === updatedRequest.id);
    if (index !== -1) {
      this.dataSource.data[index] = updatedRequest;
      this.dataSource._updateChangeSubscription(); // Force la mise à jour de la table
    }
  }

}

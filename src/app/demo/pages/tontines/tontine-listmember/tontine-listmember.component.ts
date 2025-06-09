import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TontineService } from 'src/app/@theme/services/tontine.service';
import { BaseResponse } from 'src/app/@theme/models/index';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CommonModule, DatePipe } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { PageEvent } from '@angular/material/paginator';
import { SharedModule } from 'src/app/demo/shared/shared.module';

@Component({
  selector: 'app-tontine-listmember',
  templateUrl: './tontine-listmember.component.html',
  styleUrls: ['./tontine-listmember.component.scss'],
  providers: [DatePipe],
  imports: [CommonModule,SharedModule]
})
export class TontineListmemberComponent implements OnInit {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  cotisations: any[] = [];
  isLoading = false;
  memberInfo = null;
  tontineId: number;
  membreId: number;

  // Pagination
  currentPage = 1;
  itemsPerPage = 10;
  totalItems = 0;
  totalPages = 0;

  // Filters
  statutPaiement: 'VALIDATED' | 'REJETED' | null = null;
  filterOptions = [
    { value: null, label: 'Tous' },
    { value: 'VALIDATED', label: 'Validées' },
    { value: 'PENDING', label: 'en cours' },
    { value: 'REJETED', label: 'Rejetées' }
  ];

  displayedColumns: string[] = [
    'tour',
    'montant',
    'methode',
    'statut',
    'date',
    'actions'
  ];

  constructor(
    private route: ActivatedRoute,
    private tontineService: TontineService,
    private snackBar: MatSnackBar,
    private datePipe: DatePipe,
    private dialog: MatDialog
  ) {
    this.tontineId = parseInt(this.route.snapshot.params['id']);
    this.membreId = parseInt(this.route.snapshot.queryParams['membreId']);
  }

  ngOnInit(): void {
    this.loadCotisations();
  }

  loadCotisations(): void {
    this.isLoading = true;
    this.tontineService.getCotisationsByMembre(
      this.tontineId,
      this.membreId,
      this.statutPaiement
    ).subscribe({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      next: (response: BaseResponse<any>) => {
        this.cotisations = response.data;
        if (this.cotisations.length > 0) {
          this.memberInfo = this.cotisations[0].membre.user;
        }
        this.isLoading = false;

        console.log('Cotisations:', response.data);
        console.log('Member :', this.membreId);
        console.log('Member :', this.tontineId);
      },
      error: (error) => {
        console.error('Error loading cotisations:', error);
        this.snackBar.open('Erreur lors du chargement des cotisations', 'Fermer', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
        this.isLoading = false;
      }
    });
  }

  onFilterChange(): void {
    this.currentPage = 1;
    this.loadCotisations();
  }

  onPageChange(event: PageEvent): void {
    this.currentPage = event.pageIndex + 1;
    this.itemsPerPage = event.pageSize;
    this.loadCotisations();
  }

  formatDate(date: string): string {
    return this.datePipe.transform(date, 'dd/MM/yyyy HH:mm') || '';
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'VALIDATED': return 'status-validated';
      case 'REJETED': return 'status-rejected';
      case 'PENDING': return 'status-pending';
      default: return '';
    }
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  viewJustificatif(justificatif: any): void {
    if (!justificatif) {
      this.snackBar.open('Aucun justificatif disponible', 'Fermer', {
        duration: 3000
      });
      return;
    }
    // Implémentez la logique pour afficher le justificatif
    // Par exemple, ouvrir un dialog avec l'image/PDF
  }
}

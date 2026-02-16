import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
// import { FormsModule } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';
import { finalize } from 'rxjs/operators';

// Interfaces et services
import { ConfirmDialogComponent } from 'src/app/@theme/components/confirm-dialog/confirm-dialog.component';
import { SharedModule } from 'src/app/demo/shared/shared.module';
import { FundSubscriptionService, FundSubscriptionWithdrawal, FundSubscriptionWithdrawalResponse } from 'src/app/@theme/services/fundSubscription.service';

@Component({
  selector: 'app-withdrawal-request',
  imports: [CommonModule, SharedModule],
  templateUrl: './withdrawal-request.component.html',
  styleUrls: ['./withdrawal-request.component.scss']
})
export class WithdrawalRequestComponent implements OnInit {
  // Propriétés pour les demandes de retrait
  withdrawalRequests: FundSubscriptionWithdrawal[] = [];
  isLoading = false;
  totalItems = 0;
  currentPage = 1;
  itemsPerPage = 10;

  // Filtres
  filters = {
    status: '' as 'PENDING' | 'APPROVED' | 'REJECTED' | ''
  };

  // Traitement des demandes
  isProcessingRequest = false;
  currentProcessingId: string | number | null = null;

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  private intervalId!: ReturnType<typeof setInterval>;

  constructor(
    private fundSubscriptionService: FundSubscriptionService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadWithdrawalRequests();

    // Auto-refresh every 60 seconds (60 000 ms)
    /*this.intervalId = setInterval(() => {
      this.loadWithdrawalRequests();
    }, 60000);*/
  }

  // 🔹 Chargement des demandes de retrait
  loadWithdrawalRequests(): void {
    this.isLoading = true;

    this.fundSubscriptionService.getFundWithdrawalRequests(
      this.currentPage,
      this.itemsPerPage,
      this.filters.status || undefined
    ).pipe(finalize(() => this.isLoading = false))
    .subscribe({
      next: (response: FundSubscriptionWithdrawalResponse) => {
        this.withdrawalRequests = response.data.items;
        this.totalItems = response.data.totalItems;
        console.log('funds subscription : ', response.data.items)
      },
      error: (error) => {
        console.error('Erreur chargement demandes de retrait:', error);
        this.snackBar.open('Erreur lors du chargement des demandes de retrait', 'Fermer', {
          duration: 3000
        });
      }
    });
  }

  // 🔹 Gestion de la pagination
  onPageChange(event: PageEvent): void {
    this.currentPage = event.pageIndex + 1;
    this.itemsPerPage = event.pageSize;
    this.loadWithdrawalRequests();
  }

  // 🔹 Application des filtres
  applyFilters(): void {
    this.currentPage = 1;
    this.loadWithdrawalRequests();
  }

  // 🔹 Réinitialisation des filtres
  clearFilters(): void {
    this.filters.status = '';
    this.currentPage = 1;
    this.loadWithdrawalRequests();
  }

  // 🔹 Initier une demande de retrait
  initiateWithdrawal(withdrawal: FundSubscriptionWithdrawal, action: 'APPROVED' | 'REJECTED'): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: `${action=='APPROVED'?'Initier':'Rejeter'} la demande de retrait`,
        message: `Êtes-vous sûr de vouloir ${action=='APPROVED'?'initier':'rejeter'} le retrait de ${this.calculateAmountFinal(withdrawal.type, withdrawal.fundSubscription.amount, withdrawal.fundSubscription.interestAmount)} ${withdrawal.fundSubscription.currency} ?`,
        confirmText: `${action=='APPROVED'?'Initier':'Rejeter'} le retrait`,
        cancelText: 'Annuler'
      }
    });

    dialogRef.afterClosed().subscribe(confirm => {
      if (confirm) {
        this.processWithdrawalRequest(withdrawal.id, action);
      }
    });
  }

  // 🔹 Traitement de la demande de retrait
  private processWithdrawalRequest(withdrawalId: string, action: 'APPROVED' | 'REJECTED'): void {
    this.isProcessingRequest = true;
    this.currentProcessingId = withdrawalId;
    const data = {
      requestId: withdrawalId,
      action
    }

    this.fundSubscriptionService.processRequest(data).subscribe({
      next: () => {
        this.isProcessingRequest = false;
        this.currentProcessingId = null;

        this.snackBar.open('Demande de retrait traitée avec succès!', 'Fermer', {
          duration: 5000,
          panelClass: ['success-snackbar']
        });

        // Recharger la liste
        this.loadWithdrawalRequests();
      },
      error: (error) => {
        this.isProcessingRequest = false;
        this.currentProcessingId = null;

        console.error('Erreur traitement demande de retrait : ', error);
        this.snackBar.open('Erreur lors du traitement de la demande de retrait: ' + (error.message || 'Erreur inconnue'), 'Fermer', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  calculateAmountFinal(
    type: 'INTEREST_ONLY' | 'FULL_WITHDRAWAL', 
    amount: number, 
    interestAmount: number
  ) {
    if (type === 'INTEREST_ONLY') {
      return interestAmount;
    } else {
      return amount + interestAmount;
    }
  }

  // 🔹 Formatage des dates
  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  // 🔹 Obtention du statut avec couleur
  getStatusColor(status: string): string {
    switch (status) {
      case 'VALIDATED': return '#4caf50';
      case 'PENDING': return '#ff9800';
      case 'FAILED': return '#f44336';
      case 'REJECTED': return '#9e9e9e';
      default: return '#9e9e9e';
    }
  }

  getLabelTypeInvestment(type: 'INTEREST_ONLY' | 'FULL_WITHDRAWAL'): string {
    switch (type) {
      case 'INTEREST_ONLY': return 'Récupère intérêts';
      case 'FULL_WITHDRAWAL': return 'Récupère intérêts et capital';
      default: return 'Récupère intérêts';
    }
  }

  getStatusIcon(status: string): string {
    switch (status) {
      case 'APPROVED': return 'check_circle';
      case 'PENDING': return 'schedule';
      case 'FAILED': return 'cancel';
      case 'REJECTED': return 'block';
      default: return 'help';
    }
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'APPROVED': return 'Approuvé';
      case 'PENDING': return 'En attente';
      case 'FAILED': return 'Échoué';
      case 'REJECTED': return 'Rejeté';
      default: return status;
    }
  }

  // 🔹 Vérification si une action peut être effectuée
  canInitiateWithdrawal(status: string): boolean {
    return status === 'PENDING';
  }

  // 🔹 Création d'avatar stable
  getStableColor(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const h = hash % 360;
    return `hsl(${h}, 70%, 60%)`;
  }

  createStableAvatar(name: string): { letter: string; color: string } {
    const firstLetter = name ? name.charAt(0).toUpperCase() : '?';
    return {
      letter: firstLetter,
      color: this.getStableColor(name)
    };
  }
}

import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
// import { FormsModule } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';
import { finalize } from 'rxjs/operators';

// Interfaces et services
import { MerchantWithdrawal, MerchantWithdrawalResponse } from 'src/app/@theme/models/merchant';
import { MerchantService } from 'src/app/@theme/services/merchant.service';
import { ConfirmDialogComponent } from 'src/app/@theme/components/confirm-dialog/confirm-dialog.component';
import { SharedModule } from 'src/app/demo/shared/shared.module';

@Component({
  selector: 'app-withdrawal-request',
  imports: [CommonModule, SharedModule],
  templateUrl: './withdrawal-request.component.html',
  styleUrls: ['./withdrawal-request.component.scss']
})
export class WithdrawalRequestComponent implements OnInit {
  // Propriétés pour les demandes de retrait
  withdrawalRequests: MerchantWithdrawal[] = [];
  isLoading = false;
  totalItems = 0;
  currentPage = 1;
  itemsPerPage = 10;

  // Filtres
  filters = {
    status: '' as 'PENDING' | 'COMPLETED' | 'FAILED' | 'CANCELLED' | ''
  };

  // Traitement des demandes
  isProcessingRequest = false;
  currentProcessingId: number | null = null;

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    private merchantService: MerchantService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadWithdrawalRequests();
  }

  // 🔹 Chargement des demandes de retrait
  loadWithdrawalRequests(): void {
    this.isLoading = true;

    this.merchantService.getWithdrawalRequests(
      this.currentPage,
      this.itemsPerPage,
      this.filters.status || undefined
    ).pipe(finalize(() => this.isLoading = false))
    .subscribe({
      next: (response: MerchantWithdrawalResponse) => {
        this.withdrawalRequests = response.data.items;
        this.totalItems = response.data.totalItems;
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
  initiateWithdrawal(withdrawal: MerchantWithdrawal): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Initier le retrait',
        message: `Êtes-vous sûr de vouloir initier le retrait de ${this.formatCurrency(withdrawal.amount)} pour l'agent ${withdrawal.partner.user.firstname} ${withdrawal.partner.user.lastname} ?`,
        confirmText: 'Initier le retrait',
        cancelText: 'Annuler'
      }
    });

    dialogRef.afterClosed().subscribe(confirm => {
      if (confirm) {
        this.processWithdrawalRequest(withdrawal.id);
      }
    });
  }

  // 🔹 Traitement de la demande de retrait
  private processWithdrawalRequest(withdrawalId: number): void {
    this.isProcessingRequest = true;
    this.currentProcessingId = withdrawalId;

    this.merchantService.initWithdrawalRequest(withdrawalId).subscribe({
      next: () => {
        this.isProcessingRequest = false;
        this.currentProcessingId = null;

        this.snackBar.open('Retrait initié avec succès!', 'Fermer', {
          duration: 5000,
          panelClass: ['success-snackbar']
        });

        // Recharger la liste
        this.loadWithdrawalRequests();
      },
      error: (error) => {
        this.isProcessingRequest = false;
        this.currentProcessingId = null;

        console.error('Erreur initiation retrait:', error);
        this.snackBar.open('Erreur lors de l\'initiation du retrait: ' + (error.message || 'Erreur inconnue'), 'Fermer', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  // 🔹 Formatage des montants
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XAF',
      minimumFractionDigits: 0
    }).format(amount);
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

  getStatusIcon(status: string): string {
    switch (status) {
      case 'VALIDATED': return 'check_circle';
      case 'PENDING': return 'schedule';
      case 'FAILED': return 'cancel';
      case 'REJECTED': return 'block';
      default: return 'help';
    }
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'VALIDATED': return 'Validé';
      case 'PENDING': return 'En attente';
      case 'FAILED': return 'Échoué';
      case 'REJECTED': return 'Rejeté';
      default: return status;
    }
  }

  // 🔹 Vérification si une action peut être effectuée
  canInitiateWithdrawal(status: string): boolean {
    return status === 'PENDING' || status === 'FAILED';
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

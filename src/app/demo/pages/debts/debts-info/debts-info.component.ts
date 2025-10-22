import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatMenuModule } from '@angular/material/menu';
import { finalize } from 'rxjs/operators';

import { SharedModule } from 'src/app/demo/shared/shared.module';
import { Debt, BaseResponse } from 'src/app/@theme/models';
import { DebtService } from 'src/app/@theme/services/debt.service';
import { ConfirmDialogComponent } from 'src/app/@theme/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-debts-info',
  templateUrl: './debts-info.component.html',
  styleUrls: ['./debts-info.component.scss'],
  imports: [
    CommonModule,
    SharedModule,
    FormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatSnackBarModule,
    MatDialogModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressBarModule,
    MatChipsModule,
    MatMenuModule
  ]
})
export class DebtsInfoComponent implements OnInit {
  displayedColumns: string[] = ['intitule', 'amount', 'cardId', 'createdAt', 'paymentActions', 'actions'];
  dataSource: Debt[] = [];

  isLoading = false;
  totalItems = 0;
  currentPage = 1;
  itemsPerPage = 10;
  searchText = '';
  userId: number; // À récupérer depuis l'utilisateur connecté ou via route

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    private debtService: DebtService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {
    // Récupérer l'ID utilisateur (à adapter selon votre auth service)
    this.userId = this.getCurrentUserId();
  }

  ngOnInit(): void {
    this.loadUserDebts();
  }

  private getCurrentUserId(): number {
    // Implémentez la récupération de l'ID utilisateur connecté
    // Exemple : return this.authService.currentUserValue.id;
    return 1; // Temporaire - à remplacer
  }

  loadUserDebts(): void {
    this.isLoading = true;

    this.debtService.getUserDebts(this.userId)
      .pipe(finalize(() => this.isLoading = false))
      .subscribe({
        next: (response: BaseResponse<Debt[]>) => {
          if (response.status === 200) {
            this.dataSource = response.data;
            this.totalItems = response.data.length;
          } else {
            this.showError('Erreur lors du chargement des dettes');
          }
        },
        error: (error) => {
          console.error('Erreur chargement dettes:', error);
          this.showError('Erreur lors du chargement des dettes');
        }
      });
  }

  // Payer une dette spécifique via carte
  payDebtWithCard(debt: Debt): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Paiement par carte',
        message: `Êtes-vous sûr de vouloir payer la dette "${debt.intitule}" d'un montant de ${this.formatAmount(debt.amount)} via votre carte ?`,
        confirmText: 'Payer',
        cancelText: 'Annuler'
      }
    });

    dialogRef.afterClosed().subscribe(confirm => {
      if (confirm) {
        this.performCardPayment(debt.id, debt.cardId);
      }
    });
  }

  // Payer toutes les dettes d'une carte
  payAllCardDebts(cardId: number): void {
    const cardDebts = this.dataSource.filter(debt => debt.cardId === cardId);
    const totalAmount = cardDebts.reduce((sum, debt) => sum + debt.amount, 0);

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '450px',
      data: {
        title: 'Paiement global par carte',
        message: `Êtes-vous sûr de vouloir payer toutes les dettes de la carte ${cardId} ?\n\nTotal: ${this.formatAmount(totalAmount)}\nNombre de dettes: ${cardDebts.length}`,
        confirmText: 'Tout payer',
        cancelText: 'Annuler'
      }
    });

    dialogRef.afterClosed().subscribe(confirm => {
      if (confirm) {
        this.performAllCardPayments(cardId);
      }
    });
  }

  // Payer une dette spécifique via wallet
  payDebtWithWallet(debt: Debt): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Paiement par wallet',
        message: `Êtes-vous sûr de vouloir payer la dette "${debt.intitule}" d'un montant de ${this.formatAmount(debt.amount)} via votre wallet ?`,
        confirmText: 'Payer',
        cancelText: 'Annuler'
      }
    });

    dialogRef.afterClosed().subscribe(confirm => {
      if (confirm) {
        this.performWalletPayment(debt.id, this.userId);
      }
    });
  }

  // Payer toutes les dettes via wallet
  payAllWalletDebts(): void {
    const totalAmount = this.dataSource.reduce((sum, debt) => sum + debt.amount, 0);

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '450px',
      data: {
        title: 'Paiement global par wallet',
        message: `Êtes-vous sûr de vouloir payer toutes vos dettes ?\n\nTotal: ${this.formatAmount(totalAmount)}\nNombre de dettes: ${this.dataSource.length}`,
        confirmText: 'Tout payer',
        cancelText: 'Annuler'
      }
    });

    dialogRef.afterClosed().subscribe(confirm => {
      if (confirm) {
        this.performAllWalletPayments(this.userId);
      }
    });
  }

  // Implémentations des paiements
  private performCardPayment(debtId: number, cardId: number): void {
    this.isLoading = true;
    this.debtService.payDebtFromCard(debtId, cardId)
      .pipe(finalize(() => this.isLoading = false))
      .subscribe({
        next: (response: BaseResponse<null>) => {
          if (response.status === 200) {
            this.snackBar.open('Paiement effectué avec succès!', 'Fermer', {
              duration: 3000,
              panelClass: ['success-snackbar']
            });
            this.loadUserDebts(); // Recharger la liste
          } else {
            this.showError(response.message || 'Erreur lors du paiement');
          }
        },
        error: (error) => {
          console.error('Erreur paiement carte:', error);
          this.showError('Erreur lors du paiement par carte');
        }
      });
  }

  private performAllCardPayments(cardId: number): void {
    this.isLoading = true;
    this.debtService.payAllDebtsFromCard(cardId)
      .pipe(finalize(() => this.isLoading = false))
      .subscribe({
        next: (response: BaseResponse<null>) => {
          if (response.status === 200) {
            this.snackBar.open('Tous les paiements ont été effectués avec succès!', 'Fermer', {
              duration: 4000,
              panelClass: ['success-snackbar']
            });
            this.loadUserDebts();
          } else {
            this.showError(response.message || 'Erreur lors des paiements');
          }
        },
        error: (error) => {
          console.error('Erreur paiements carte:', error);
          this.showError('Erreur lors des paiements par carte');
        }
      });
  }

  private performWalletPayment(debtId: number, userId: number): void {
    this.isLoading = true;
    this.debtService.payDebtFromWallet(debtId, userId)
      .pipe(finalize(() => this.isLoading = false))
      .subscribe({
        next: (response: BaseResponse<null>) => {
          if (response.status === 200) {
            this.snackBar.open('Paiement effectué avec succès!', 'Fermer', {
              duration: 3000,
              panelClass: ['success-snackbar']
            });
            this.loadUserDebts();
          } else {
            this.showError(response.message || 'Erreur lors du paiement');
          }
        },
        error: (error) => {
          console.error('Erreur paiement wallet:', error);
          this.showError('Erreur lors du paiement par wallet');
        }
      });
  }

  private performAllWalletPayments(userId: number): void {
    this.isLoading = true;
    this.debtService.payAllDebtsFromWallet(userId)
      .pipe(finalize(() => this.isLoading = false))
      .subscribe({
        next: (response: BaseResponse<null>) => {
          if (response.status === 200) {
            this.snackBar.open('Tous les paiements ont été effectués avec succès!', 'Fermer', {
              duration: 4000,
              panelClass: ['success-snackbar']
            });
            this.loadUserDebts();
          } else {
            this.showError(response.message || 'Erreur lors des paiements');
          }
        },
        error: (error) => {
          console.error('Erreur paiements wallet:', error);
          this.showError('Erreur lors des paiements par wallet');
        }
      });
  }

  // Méthodes utilitaires
  applyFilter(value: string): void {
    this.searchText = value.trim().toLowerCase();
    // Filtrage côté client
  }

  resetFilters(): void {
    this.searchText = '';
    this.loadUserDebts();
  }

  formatAmount(amount: number): string {
    return new Intl.NumberFormat('fr-FR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount) + ' XAF';
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getAmountColor(amount: number): string {
    if (amount > 100000) return '#f44336';
    if (amount > 50000) return '#ff9800';
    return '#4caf50';
  }

  getCardIds(): number[] {
    return [...new Set(this.dataSource.map(debt => debt.cardId))];
  }

  getCardDebtsCount(cardId: number): number {
    return this.dataSource.filter(debt => debt.cardId === cardId).length;
  }

  getCardTotalAmount(cardId: number): number {
    return this.dataSource
      .filter(debt => debt.cardId === cardId)
      .reduce((sum, debt) => sum + debt.amount, 0);
  }

  private showError(message: string): void {
    this.snackBar.open(message, 'Fermer', {
      duration: 5000,
      panelClass: ['error-snackbar']
    });
  }

  // Navigation et actions supplémentaires
  viewDebtDetails(debt: Debt): void {
    this.snackBar.open(`Détails de la dette: ${debt.intitule}`, 'Fermer', {
      duration: 3000
    });
  }

  exportDebts(): void {
    this.snackBar.open('Export des dettes en cours...', 'Fermer', {
      duration: 3000
    });
  }
}

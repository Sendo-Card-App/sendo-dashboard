import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
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
import { Debt, BaseResponse, PartialPaymentDto } from 'src/app/@theme/models';
import { DebtService } from 'src/app/@theme/services/debt.service';
import { ConfirmDialogComponent } from 'src/app/@theme/components/confirm-dialog/confirm-dialog.component';
import { PartialPaymentDialogComponent } from 'src/app/@theme/components/partial-payment-dialog/partial-payment-dialog.component';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-debts-info',
  templateUrl: './debts-info.component.html',
  styleUrls: ['./debts-info.component.scss'],
  imports: [
    CommonModule,
    SharedModule,
    FormsModule,
    MatTableModule,
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
  displayedColumns = ['intitule', 'amount', 'card', 'balance', 'createdAt', 'paymentActions'];
  dataSource: Debt[] = [];
  filteredDataSource: Debt[] = [];
  allDebts: Debt[] = [];

  isLoading = false;
  searchText = '';
  userId: number;

  constructor(
    private debtService: DebtService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private route: ActivatedRoute
  ) {
  }

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (!idParam) {
      this.snackBar.open('Aucun identifiant fourni', 'Fermer', { duration: 3000 });
      return;
    }

    this.userId = Number(idParam);

    this.loadUserDebts();
  }



  loadUserDebts(): void {
    this.isLoading = true;

    this.debtService.getUserDebts(this.userId)
      .pipe(finalize(() => this.isLoading = false))
      .subscribe({
        next: (response) => {
          if (response.status === 200) {
            this.allDebts = response.data;
            this.filteredDataSource = [...this.allDebts];

            console.log("Dettes utilisateur chargées:", response);
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

  // Paiement total via carte
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

  // Paiement partiel via carte
  partialPayDebtWithCard(debt: Debt): void {
    const dialogRef = this.dialog.open(PartialPaymentDialogComponent, {

      data: {
        title: 'Paiement partiel par carte',
        debt: debt,
        maxAmount: debt.amount,
        paymentMethod: 'card'
      }
    });

    dialogRef.afterClosed().subscribe((result: { amount: number } | null) => {
      if (result) {
        const dto: PartialPaymentDto = {
          partialAmount: result.amount,
          idCard: debt.card.id
        };
        this.performPartialCardPayment(debt.id, dto);
      }
    });
  }

  // Paiement total via wallet
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

  // Paiement partiel via wallet
  partialPayDebtWithWallet(debt: Debt): void {
    const dialogRef = this.dialog.open(PartialPaymentDialogComponent, {
      // width: '450px',
      data: {
        title: 'Paiement partiel par wallet',
        debt: debt,
        maxAmount: debt.amount,
        paymentMethod: 'wallet'
      }
    });

    dialogRef.afterClosed().subscribe((result: { amount: number } | null) => {
      if (result) {
        const dto: PartialPaymentDto = {
          partialAmount: result.amount,
          userId: this.userId
        };
        this.performPartialWalletPayment(debt.id, dto);
      }
    });
  }

  // Payer toutes les dettes d'une carte
  payAllCardDebts(cardId: number): void {
    const cardDebts = this.allDebts.filter(debt => debt.cardId === cardId);
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

  // Payer toutes les dettes via wallet
  payAllWalletDebts(): void {
    const totalAmount = this.allDebts.reduce((sum, debt) => sum + debt.amount, 0);

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '450px',
      data: {
        title: 'Paiement global par wallet',
        message: `Êtes-vous sûr de vouloir payer toutes vos dettes ?\n\nTotal: ${this.formatAmount(totalAmount)}\nNombre de dettes: ${this.allDebts.length}`,
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

  // Supprimer une dette
  deleteDebt(debt: Debt): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '450px',
      data: {
        title: 'Supprimer la dette',
        message: `Êtes-vous sûr de vouloir supprimer la dette "${debt.intitule}" d'un montant de ${this.formatAmount(debt.amount)} ? Cette action est irréversible.`,
        confirmText: 'Supprimer',
        cancelText: 'Annuler'
      }
    });

    dialogRef.afterClosed().subscribe(confirm => {
      if (confirm) {
        this.performDebtDeletion(debt.id);
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
            this.loadUserDebts();
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

  private performPartialCardPayment(debtId: number, dto: PartialPaymentDto): void {
    this.isLoading = true;
    this.debtService.partialPayDebtFromCard(debtId, dto)
      .pipe(finalize(() => this.isLoading = false))
      .subscribe({
        next: (response: BaseResponse<Debt>) => {
          if (response.status === 200) {
            this.snackBar.open(`Paiement partiel de ${this.formatAmount(dto.partialAmount)} effectué avec succès!`, 'Fermer', {
              duration: 3000,
              panelClass: ['success-snackbar']
            });
            this.loadUserDebts();
          } else {
            this.showError(response.message || 'Erreur lors du paiement partiel');
          }
        },
        error: (error) => {
          console.error('Erreur paiement partiel carte:', error);
          this.showError('Erreur lors du paiement partiel par carte');
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

  private performPartialWalletPayment(debtId: number, dto: PartialPaymentDto): void {
    this.isLoading = true;
    // console.log('Démarrage du paiement partiel wallet avec DTO:', dto);
    this.debtService.partialPayDebtFromWallet(debtId, dto)
      .pipe(finalize(() => this.isLoading = false))
      .subscribe({
        next: (response: BaseResponse<Debt>) => {
          if (response.status === 200) {
            this.snackBar.open(`Paiement partiel de ${this.formatAmount(dto.partialAmount)} effectué avec succès!`, 'Fermer', {
              duration: 3000,
              panelClass: ['success-snackbar']
            });
            this.loadUserDebts();
          } else {
            this.showError(response.message || 'Erreur lors du paiement partiel');
            console.error('Erreur paiement partiel wallet réponse:', response);
          }
        },
        error: (error) => {
          console.error('Erreur paiement partiel wallet:', error);
          this.showError('Erreur lors du paiement partiel par wallet');
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

  private performDebtDeletion(debtId: number): void {
    this.isLoading = true;
    this.debtService.deleteDebt(debtId)
      .pipe(finalize(() => this.isLoading = false))
      .subscribe({
        next: (response: BaseResponse<null>) => {
          if (response.status === 200) {
            this.snackBar.open('Dette supprimée avec succès!', 'Fermer', {
              duration: 3000,
              panelClass: ['success-snackbar']
            });
            this.loadUserDebts();
          } else {
            this.showError(response.message || 'Erreur lors de la suppression');
          }
        },
        error: (error) => {
          console.error('Erreur suppression dette:', error);
          this.showError('Erreur lors de la suppression de la dette');
        }
      });
  }

  // Méthodes utilitaires
  applyFilter(value: string): void {
    this.searchText = value.trim().toLowerCase();

    if (this.searchText) {
      this.applyLocalFilter();
    } else {
      this.filteredDataSource = [...this.allDebts];
    }
  }

  private applyLocalFilter(): void {
    if (!this.searchText) {
      this.filteredDataSource = [...this.allDebts];
      return;
    }

    this.filteredDataSource = this.allDebts.filter(debt =>
      debt.intitule.toLowerCase().includes(this.searchText) ||
      debt.amount.toString().includes(this.searchText) ||
      debt.cardId.toString().includes(this.searchText) ||
      this.formatDate(debt.createdAt).toLowerCase().includes(this.searchText)
    );
  }

  resetFilters(): void {
    this.searchText = '';
    this.filteredDataSource = [...this.allDebts];
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
      day: 'numeric'
    });
  }

  getAmountColor(amount: number): string {
    if (amount > 100000) return '#f44336';
    if (amount > 50000) return '#ff9800';
    return '#4caf50';
  }

  getAmountStatus(amount: number): string {
    if (amount > 100000) return 'Élevé';
    if (amount > 50000) return 'Moyen';
    return 'Faible';
  }

  getStableColor(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const h = hash % 360;
    return `hsl(${h}, 70%, 60%)`;
  }

  createStableAvatar(debt: Debt): { letter: string; color: string } {
    const firstLetter = debt.intitule ? debt.intitule.charAt(0).toUpperCase() : '?';
    return {
      letter: firstLetter,
      color: this.getStableColor(debt.intitule)
    };
  }

  getCardIds(): number[] {
    return [...new Set(this.allDebts.map(debt => debt.cardId))];
  }

  getCardDebtsCount(cardId: number): number {
    return this.allDebts.filter(debt => debt.cardId === cardId).length;
  }

  getCardTotalAmount(cardId: number): number {
    return this.allDebts
      .filter(debt => debt.cardId === cardId)
      .reduce((sum, debt) => sum + debt.amount, 0);
  }

  getDaysAgo(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return 'Hier';
    if (diffDays < 7) return `Il y a ${diffDays} jours`;
    if (diffDays < 30) return `Il y a ${Math.floor(diffDays / 7)} semaines`;
    return `Il y a ${Math.floor(diffDays / 30)} mois`;
  }

  getCardInfo(debt: Debt): string {
    if (debt.card) {
      return `${debt.card.cardName} (****${debt.card.last4Digits})`;
    }
    return `Carte ${debt.cardId}`;
  }

  getWalletBalance(): number {
    const firstDebt = this.allDebts[0];
    return firstDebt?.user?.wallet?.balance || 0;
  }

  private showError(message: string): void {
    this.snackBar.open(message, 'Fermer', {
      duration: 5000,
      panelClass: ['error-snackbar']
    });
  }
}

import { Router } from '@angular/router';
import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatPaginator, PageEvent, MatPaginatorModule } from '@angular/material/paginator';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatChipsModule } from '@angular/material/chips';
import { finalize } from 'rxjs/operators';

import { SharedModule } from 'src/app/demo/shared/shared.module';
import { Debt, DebtResponse } from 'src/app/@theme/models';
import { DebtService } from 'src/app/@theme/services/debt.service';

@Component({
  selector: 'app-debts-all',
  templateUrl: './debts-all.component.html',
  styleUrls: ['./debts-all.component.scss'],
  imports: [
    CommonModule,
    SharedModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatPaginatorModule,
    MatTooltipModule,
    MatSnackBarModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressBarModule,
    MatChipsModule
  ]
})
export class DebtsAllComponent implements OnInit {
  displayedColumns = ['intitule', 'amount', 'user', 'card', 'createdAt', 'action'];
  dataSource: Debt[] = [];
  filteredDataSource: Debt[] = [];
  allDebts: Debt[] = [];

  isLoading = false;
  totalItems = 0;
  currentPage = 1;
  itemsPerPage = 10;
  searchText = '';

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    private debtService: DebtService,
    private snackBar: MatSnackBar,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadDebts();
  }

  loadDebts(): void {
    this.isLoading = true;

    this.debtService.getAllDebts(this.currentPage, this.itemsPerPage)
      .pipe(finalize(() => this.isLoading = false))
      .subscribe({
        next: (response: DebtResponse) => {
          if (response.status === 200) {
            this.allDebts = response.data.items;
            this.totalItems = response.data.totalItems;
            this.currentPage = response.data.page;

            if (this.searchText) {
              this.applyLocalFilter();
            } else {
              this.filteredDataSource = [...this.allDebts];
            }
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

  applyFilter(value: string): void {
    this.searchText = value.trim().toLowerCase();
    this.currentPage = 1;

    if (this.searchText) {
      this.applyLocalFilter();
    } else {
      this.loadDebts();
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
      (debt.user?.firstname + ' ' + debt.user?.lastname).toLowerCase().includes(this.searchText) ||
      debt.cardId.toString().includes(this.searchText) ||
      this.formatDate(debt.createdAt).toLowerCase().includes(this.searchText)
    );
  }

  onPageChange(e: PageEvent): void {
    this.itemsPerPage = e.pageSize;
    this.currentPage = e.pageIndex + 1;

    if (this.searchText) {
      this.applyLocalFilter();
    } else {
      this.loadDebts();
    }
  }

  resetFilters(): void {
    this.searchText = '';
    this.currentPage = 1;
    this.loadDebts();
  }

  // Méthodes utilitaires
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

  formatUserName(debt: Debt): string {
    return debt.user ? `${debt.user.firstname} ${debt.user.lastname}` : `User ${debt.userId}`;
  }

  formatUserContact(debt: Debt): string {
    if (!debt.user) return 'N/A';
    return debt.user.email || debt.user.phone || 'N/A';
  }

  formatCardInfo(debt: Debt): string {
    if (debt.card) {
      return `${debt.card.cardName} (****${debt.card.last4Digits})`;
    }
    return `Carte ${debt.cardId}`;
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

  private showError(message: string): void {
    this.snackBar.open(message, 'Fermer', {
      duration: 3000,
      panelClass: ['error-snackbar']
    });
  }

  viewDebtDetails(debt: Debt): void {
    this.router.navigate(['/debts', debt.userId]);
  }

  exportDebts(): void {
    this.snackBar.open('Export des dettes en cours...', 'Fermer', {
      duration: 3000
    });
  }
}

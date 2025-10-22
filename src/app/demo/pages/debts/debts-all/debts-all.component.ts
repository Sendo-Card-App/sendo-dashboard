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
    MatProgressBarModule
  ]
})
export class DebtsAllComponent implements OnInit {
  displayedColumns: string[] = ['intitule', 'amount', 'userId', 'cardId', 'createdAt', 'actions'];
  dataSource: Debt[] = [];
  filteredDataSource: Debt[] = [];
  allDebts: Debt[] = []; // Stocke toutes les dettes récupérées

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

            // Appliquer le filtre local si un texte de recherche existe
            if (this.searchText) {
              this.applyLocalFilter();
            } else {
              this.filteredDataSource = [...this.allDebts];
            }

            console.log('Dettes chargées:', this.allDebts);
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
      // Filtrage local uniquement
      this.applyLocalFilter();
    } else {
      // Si pas de recherche, recharger depuis l'API pour avoir les données complètes
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
      debt.userId.toString().includes(this.searchText) ||
      debt.cardId.toString().includes(this.searchText) ||
      this.formatDate(debt.createdAt).toLowerCase().includes(this.searchText)
    );
  }

  onPageChange(e: PageEvent): void {
    this.itemsPerPage = e.pageSize;
    this.currentPage = e.pageIndex + 1;

    if (this.searchText) {
      // En mode recherche, on reste sur les données filtrées localement
      // Mais on peut aussi recharger depuis l'API si on veut des nouvelles données
      this.applyLocalFilter();
    } else {
      // Sans recherche, on charge la nouvelle page depuis l'API
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
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getAmountColor(amount: number): string {
    if (amount > 100000) return '#f44336'; // Rouge pour les grosses dettes
    if (amount > 50000) return '#ff9800';  // Orange pour les dettes moyennes
    return '#4caf50';                      // Vert pour les petites dettes
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


  editDebt(debt: Debt): void {
    this.snackBar.open(`Modification de la dette: ${debt.intitule}`, 'Fermer', {
      duration: 3000
    });
  }

  deleteDebt(debt: Debt): void {
    this.snackBar.open(`Suppression de la dette: ${debt.intitule}`, 'Fermer', {
      duration: 3000
    });
  }

  exportDebts(): void {
    this.snackBar.open('Export des dettes en cours...', 'Fermer', {
      duration: 3000
    });
  }
}

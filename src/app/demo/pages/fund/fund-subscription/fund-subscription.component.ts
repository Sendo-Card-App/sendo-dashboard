import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
// import { FormsModule } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';
import { finalize } from 'rxjs/operators';

// Interfaces et services
import { SharedModule } from 'src/app/demo/shared/shared.module';
import { FundSubscription, FundSubscriptionResponse, FundSubscriptionService } from 'src/app/@theme/services/fundSubscription.service';

@Component({
  selector: 'app-fund-subscription',
  imports: [CommonModule, SharedModule],
  templateUrl: './fund-subscription.component.html',
  styleUrls: ['./fund-subscription.component.scss']
})
export class FundSubscriptionComponent implements OnInit {
  // Propriétés pour les demandes de retrait
  fundSubscriptions: FundSubscription[] = [];
  isLoading = false;
  totalItems = 0;
  currentPage = 1;
  itemsPerPage = 10;

  // Filtres
  filters = {
    status: '' as 'MATURED' | 'ACTIVE' | 'CLOSED' | '',
    currency: '' as 'CAD' | 'XAF' | ''
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
    this.loadFundSubscriptions();

    // Auto-refresh every 60 seconds (60 000 ms)
    /*this.intervalId = setInterval(() => {
      this.loadWithdrawalRequests();
    }, 60000);*/
  }

  // 🔹 Chargement des souscriptions
  loadFundSubscriptions(): void {
    this.isLoading = true;

    this.fundSubscriptionService.getFundSubscriptions(
      this.currentPage,
      this.itemsPerPage,
      this.filters.currency || undefined,
      this.filters.status || undefined
    ).pipe(finalize(() => this.isLoading = false))
    .subscribe({
      next: (response: FundSubscriptionResponse) => {
        this.fundSubscriptions = response.data.items;
        this.totalItems = response.data.totalItems;
        console.log('funds subscription : ', response.data.items)
      },
      error: (error) => {
        console.error('Erreur chargement souscriptions :', error);
        this.snackBar.open('Erreur lors du chargement des souscriptions', 'Fermer', {
          duration: 3000
        });
      }
    });
  }

  // 🔹 Gestion de la pagination
  onPageChange(event: PageEvent): void {
    this.currentPage = event.pageIndex + 1;
    this.itemsPerPage = event.pageSize;
    this.loadFundSubscriptions();
  }

  // 🔹 Application des filtres
  applyFilters(): void {
    this.currentPage = 1;
    this.loadFundSubscriptions();
  }

  // 🔹 Réinitialisation des filtres
  clearFilters(): void {
    this.filters.status = '';
    this.filters.currency = '';
    this.currentPage = 1;
    this.loadFundSubscriptions();
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
      case 'ACTIVE': return '#4caf50';
      case 'MATURED': return '#ff9800';
      case 'CLOSED': return '#f44336';
      case 'REJECTED': return '#9e9e9e';
      default: return '#9e9e9e';
    }
  }

  getStatusIcon(status: string): string {
    switch (status) {
      case 'MATURED': return 'check_circle';
      case 'ACTIVE': return 'schedule';
      case 'CLOSED': return 'CLOSED';
      case 'REJECTED': return 'block';
      default: return 'help';
    }
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'ACTIVE': return 'Actif';
      case 'MATURED': return 'A terme';
      case 'CLOSED': return 'Cloturé';
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

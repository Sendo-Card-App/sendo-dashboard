import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CardService } from 'src/app/@theme/services/card.service';
import { CardStatus, VirtualCard } from 'src/app/@theme/models/card';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CommonModule, Location } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from 'src/app/@theme/components/confirm-dialog/confirm-dialog.component';
import { SharedModule } from 'src/app/demo/shared/shared.module';
import { AuthenticationService } from 'src/app/@theme/services/authentication.service';

@Component({
  selector: 'app-card-detail',
  templateUrl: './card-detail.component.html',
  styleUrls: ['./card-detail.component.scss'],
  imports: [SharedModule, CommonModule],
})
export class CardDetailComponent implements OnInit {
  isLoading = false;
  isUpdating = false;
  card: VirtualCard | null = null;
  cardId!: number;
  currentuserRole: string[] | undefined;

  constructor(
    private route: ActivatedRoute,
    private cardService: CardService,
    private snackBar: MatSnackBar,
    private location: Location,
    private dialog: MatDialog,
    private router: Router,
    private authentificationService: AuthenticationService
  ) { }

  ngOnInit(): void {
    this.currentuserRole = this.authentificationService.currentUserValue?.user.role;
    this.cardId = Number(this.route.snapshot.paramMap.get('id'));
    this.loadCardDetails();
  }

  loadCardDetails(): void {
    this.isLoading = true;
    this.cardService.getCardById(this.cardId).subscribe({
      next: (response) => {
        this.card = response.data;
        this.isLoading = false;
        console.log('Card details loaded:', response, response.data);
      },
      error: (err) => {
        console.error('Error loading card details', err);
        this.showError('Erreur lors du chargement des détails de la carte');
        this.isLoading = false;
      }
    });
  }

  toggleCardStatus(newStatus: 'FREEZE' | 'UNFREEZE'): void {
    if (!this.card) return;

    this.isUpdating = true;
    const action = newStatus === 'FREEZE' ? 'bloquer' : 'débloquer';

    this.cardService.freezeOrUnfreezeCard(this.cardId, newStatus).subscribe({
      next: () => {
        this.showSuccess(`Carte ${action} avec succès`);
        this.card!.status = newStatus === 'FREEZE' ? 'FROZEN' : 'ACTIVE';
        this.isUpdating = false;
      },
      error: (err) => {
        console.error(`Error ${action} card`, err);
        this.showError(`Erreur lors de l'opération de ${action}`);
        this.isUpdating = false;
      }
    });
  }

  deleteCard(): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Confirmer la suppression',
        message: 'Êtes-vous sûr de vouloir supprimer définitivement cette carte ?',
        confirmText: 'Supprimer',
        confirmColor: 'warn'
      }
    });

    dialogRef.afterClosed().subscribe(confirmed => {
      if (confirmed) {
        this.isUpdating = true;
        this.cardService.deleteCard(this.cardId).subscribe({
          next: () => {
            this.showSuccess('Carte supprimée avec succès');
            this.location.back();
          },
          error: (err) => {
            console.error('Error deleting card', err);
            this.showError('Erreur lors de la suppression de la carte');
            this.isUpdating = false;
          }
        });
      }
    });
  }

   formatStatus(status: string | undefined): string {
  const statusMap: Partial<Record<CardStatus, string>> = {
    'PRE_ACTIVE': 'Pré-activée',
    'ACTIVE': 'Active',
    'FROZEN': 'Bloquée',
    'TERMINATED': 'Résiliée',
    'IN_TERMINATION': 'En résiliation',
    'SUSPENDED': 'Suspendue',
  };
  if (!status) return 'Inconnu';
  return statusMap[status as CardStatus] ?? status;
}

  getStatusClass(status: CardStatus): string {
    return `status-${status.toLowerCase()}`;
  }

  goBack(): void {
    this.location.back();
  }

  private showSuccess(message: string): void {
    this.snackBar.open(message, 'Fermer', { duration: 3000 });
  }

  private showError(message: string): void {
    this.snackBar.open(message, 'Fermer', { duration: 3000 });
  }

  viewDetails(cardId: number): void {
    this.router.navigate(['/card/', cardId, 'list']);
  }

  formatBalance(balance: number, currency: string): string {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0
    }).format(balance);
  }
}

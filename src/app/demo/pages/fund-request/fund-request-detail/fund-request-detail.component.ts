import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FundRequestService } from 'src/app/@theme/services/fundrequest.service';
import {FundRequest } from 'src/app/@theme/models/index';
import { CommonModule, DatePipe } from '@angular/common';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from 'src/app/@theme/components/confirm-dialog/confirm-dialog.component';
import { SharedModule } from 'src/app/demo/shared/shared.module';



@Component({
  selector: 'app-fund-request-detail',
  templateUrl: './fund-request-detail.component.html',
  styleUrls: ['./fund-request-detail.component.scss'],
  providers: [DatePipe],
  imports: [CommonModule, SharedModule]
})
export class FundRequestDetailComponent implements OnInit {
  fundRequest: FundRequest | null = null;
  isLoading = false;
  isDeadlinePassed = false;

  constructor(
    private route: ActivatedRoute,
    private fundRequestService: FundRequestService,
    private datePipe: DatePipe,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private router:Router
  ) {}

  ngOnInit(): void {
    this.loadFundRequest();
  }

  loadFundRequest(): void {
    this.isLoading = true;
    const id = this.route.snapshot.params['id'];

    this.fundRequestService.getFundRequestById(id).subscribe({
      next: (response) => {
        this.fundRequest = response.data;
        this.checkDeadline();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading fund request:', error);
        this.isLoading = false;
        this.snackBar.open('Erreur lors du chargement de la demande', 'Fermer', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  checkDeadline(): void {
    if (!this.fundRequest?.deadline) return;
    const deadline = new Date(this.fundRequest.deadline);
    this.isDeadlinePassed = deadline < new Date();
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'PENDING': return 'status-pending';
      case 'PARTIALLY_FUNDED': return 'status-partial';
      case 'FULLY_FUNDED': return 'status-completed';
      case 'CANCELLED': return 'status-cancelled';
      default: return '';
    }
  }

  formatDate(dateString: string): string {
    return this.datePipe.transform(dateString, 'dd/MM/yyyy HH:mm') || '';
  }

  formatCurrency(amount: number): string {
    return amount.toLocaleString('fr-FR', { style: 'currency', currency: 'XAF' });
  }

  calculateFundedPercentage(): number {
    if (!this.fundRequest) return 0;

    const totalPaid = this.fundRequest.recipients.reduce((sum, recipient) => {
      return sum + recipient.payments.reduce((paymentSum, payment) => {
        return paymentSum + (payment.amount || 0);
      }, 0);
    }, 0);

    return Math.round((totalPaid / this.fundRequest.amount) * 100);
  }

  // Dans fund-request-detail.component.ts
confirmDelete(): void {
  if (!this.fundRequest) return;

  const dialogRef = this.dialog.open(ConfirmDialogComponent, {
    data: {
      title: 'Confirmer la suppression',
      message: `Voulez-vous vraiment supprimer définitivement la demande ${this.fundRequest.reference} ?`,
      confirmText: 'Oui, supprimer',
      cancelText: 'Non, annuler',
      confirmColor: 'warn'
    }
  });

  dialogRef.afterClosed().subscribe(confirmed => {
    if (confirmed) {
      this.deleteFundRequest();
    }
  });
}

deleteFundRequest(): void {
  if (!this.fundRequest) return;

  this.isLoading = true;
  this.fundRequestService.deleteFundRequestAsAdmin(this.fundRequest.id).subscribe({
    next: (response) => {
      this.snackBar.open(response.message || 'Demande supprimée avec succès', 'Fermer', {
        duration: 3000,
        panelClass: ['success-snackbar']
      });
      // Rediriger vers la liste après suppression
      this.router.navigate(['/fund-requests/all']);
    },
    error: (error) => {
      console.error('Error deleting fund request:', error);
      this.isLoading = false;
      this.snackBar.open('Erreur lors de la suppression', 'Fermer', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
    }
  });
}
}

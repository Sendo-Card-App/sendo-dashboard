// src/app/demo/transaction-detail/transaction-detail.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

import { ChangeTransactionStatusPayload, TransactionsService } from 'src/app/@theme/services/transactions.service';
import { BaseResponse, MeResponse, Transactions } from 'src/app/@theme/models';
import { SharedModule } from 'src/app/demo/shared/shared.module';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from 'src/app/@theme/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-transaction-detail',
  standalone: true,
  imports: [
    CommonModule,
    SharedModule
  ],
  templateUrl: './transaction-detail.component.html',
  styleUrls: ['./transaction-detail.component.scss']
})
export class TransactionDetailComponent implements OnInit {
  transaction: Transactions | null = null;
  isLoading = false;
  isEditing = false;
  statusForm: FormGroup;
  statusOptions = ['PENDING', 'COMPLETED', 'FAILED','BLOCKED'];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private transactionsService: TransactionsService,
    private fb: FormBuilder,
     private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {
     this.statusForm = this.fb.group({
    status: ['', Validators.required],
    transactionReference: ['', Validators.required],
    bankName: ['', Validators.required],
    accountNumber: ['', Validators.required]
  });

  }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('transactionId');
      if (id) {
        this.loadTransaction(id);
      } else {
        this.router.navigate(['/transactions']);
      }
    });
  }

  private loadTransaction(transactionId: string): void {
    this.isLoading = true;
    this.transactionsService.getTransactionById(transactionId).subscribe({
      next: (res: BaseResponse<Transactions>) => {
        this.transaction = res.data;
        this.statusForm.patchValue({ status: this.transaction?.status || 'PENDING' });
        this.isLoading = false;
      },
      error: () => {
        this.snackBar.open('Erreur lors du chargement de la transaction', 'Fermer', { duration: 3000 });
        this.router.navigate(['/transactions']);
        this.isLoading = false;
      }
    });
  }
 toggleEdit(): void {
    this.isEditing = !this.isEditing;
    if (this.isEditing && this.transaction) {
      this.statusForm.patchValue({
        status: this.transaction.status,
        transactionReference: this.transaction.transactionReference || '',
        bankName: this.transaction.bankName || '',
        accountNumber: this.transaction.accountNumber || ''
      });
    }
  }
  UpdateUserStatus(): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
          width: '400px',
          data: {
            title: 'Alerte Mise à jour',
            message: 'Êtes-vous sûr de vouloir transferer les '+ this.transaction?.amount +' '+ this.transaction?.currency +' ?',
            confirmText: 'Mettre à jour',
            cancelText: 'Annuler'
          }
        });

        dialogRef.afterClosed().subscribe(result => {
          if (result) {
            this.updateStatus();
          }
        });
  }

  updateStatus(): void {
    if (!this.transaction || !this.statusForm.valid) return;

    this.isLoading = true;
    const formValue = this.statusForm.value;
    const newStatus = formValue.status as 'PENDING' | 'COMPLETED' | 'FAILED' | 'BLOCKED';

    const payload: ChangeTransactionStatusPayload = {
      transactionReference: formValue.transactionReference!,
      bankName: formValue.bankName!,
      accountNumber: formValue.accountNumber!
    };

    this.transactionsService.updateTransactionStatus(
      this.transaction.transactionId,
      newStatus,
      payload
    ).subscribe({
       next: () => {
      if (this.transaction) {
        this.transaction.status = newStatus;
      }
      this.snackBar.open('Statut mis à jour avec succès', 'Fermer', { duration: 3000 });
      this.isEditing = false;
      this.isLoading = false;
      this.statusForm.markAsPristine();
    },
    error: () => {
      this.snackBar.open('Erreur lors de la mise à jour du statut', 'Fermer', { duration: 3000 });
      this.isLoading = false;
    }
    });
  }


  getUserInitials(user: MeResponse): string {
    if (!user) return '?';
    return `${user.firstname?.charAt(0) || ''}${user.lastname?.charAt(0) || ''}`.toUpperCase() || '?';
  }

  getUserColor(): string {
    // Implémentez une logique de génération de couleur stable si nécessaire
    return '#3f51b5'; // Couleur par défaut
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'PENDING': return 'status-pending';
      case 'COMPLETED': return 'status-completed';
      case 'FAILED': return 'status-failed';
      case 'BLOCKED': return 'status-blocked';
      default: return '';
    }
  }

  getTypeClass(type: string): string {
    switch (type) {
      case 'DEPOSIT': return 'bg-primary';
      case 'WITHDRAWAL': return 'bg-success';
      case 'TRANSFER': return 'bg-warning';
      default: return 'bg-secondary';
    }
  }

  copyToClipboard(text: string): void {
    if (!text) return;
    navigator.clipboard.writeText(text).then(() => {
      this.snackBar.open('Copié dans le presse-papiers', 'Fermer', { duration: 2000 });
    });
  }

  formatType(type: string): string {
    return type ? type.toLowerCase().replace('_', ' ') : '';
  }

  formatDate(date: string): string {
    return date ? new Date(date).toLocaleString() : '';
  }
}

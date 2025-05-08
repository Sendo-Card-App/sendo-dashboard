// src/app/demo/transaction-detail/transaction-detail.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

import { TransactionsService } from 'src/app/@theme/services/transactions.service';
import { BaseResponse, MeResponse, Transactions } from 'src/app/@theme/models';
import { SharedModule } from 'src/app/demo/shared/shared.module';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';

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
  statusOptions = ['PENDING', 'COMPLETED', 'FAILED'];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private transactionsService: TransactionsService,
    private fb: FormBuilder,
    private snackBar: MatSnackBar
  ) {
    this.statusForm = this.fb.group({
      status: ['']
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
    if (!this.isEditing && this.transaction) {
      this.statusForm.reset({ status: this.transaction.status });
    }
  }

  // updateStatus(): void {
  //   if (!this.transaction || !this.statusForm.valid) return;

  //   this.isLoading = true;
  //   const newStatus = this.statusForm.value.status;

  //   this.transactionsService.updateTransactionStatus(this.transaction.transactionId, newStatus)
  //     .subscribe({
  //       next: () => {
  //         if (this.transaction) {
  //           this.transaction.status = newStatus;
  //         }
  //         this.snackBar.open('Statut mis à jour avec succès', 'Fermer', { duration: 3000 });
  //         this.isEditing = false;
  //         this.isLoading = false;
  //       },
  //       error: () => {
  //         this.snackBar.open('Erreur lors de la mise à jour du statut', 'Fermer', { duration: 3000 });
  //         this.isLoading = false;
  //       }
  //     });
  // }

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

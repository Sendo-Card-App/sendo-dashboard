import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SharedExpenseService } from 'src/app/@theme/services/sharedexpenses.service';
import { SharedExpense, Participant, SharedExpenseResponse, BaseResponse } from 'src/app/@theme/models/index';
import { CommonModule, DatePipe } from '@angular/common';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from 'src/app/@theme/components/confirm-dialog/confirm-dialog.component';
import { SharedModule } from 'src/app/demo/shared/shared.module';

@Component({
  selector: 'app-shared-expense-detail',
  templateUrl: './shared-expense-detail.component.html',
  styleUrls: ['./shared-expense-detail.component.scss'],
  providers: [DatePipe],
  imports: [CommonModule, SharedModule]
})
export class SharedExpenseDetailComponent implements OnInit {
  sharedExpense: SharedExpense | null = null;
  isLoading = false;
  isEditing = false;
  isCancelling = false;

  statusForm: FormGroup;
  statusOptions = ['PENDING', 'PAYED', 'LATE', 'REFUSED'];

  constructor(
    private route: ActivatedRoute,
    private sharedExpenseService: SharedExpenseService,
    private datePipe: DatePipe,
    private snackBar: MatSnackBar,
    private fb: FormBuilder,
    private dialog: MatDialog
  ) {
    this.statusForm = this.fb.group({
      status: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadSharedExpense();
  }

  loadSharedExpense(): void {
    this.isLoading = true;
    const id = this.route.snapshot.params['id'];

    this.sharedExpenseService.getSharedExpenseById(id).subscribe({
      next: (response: BaseResponse<SharedExpense>) => {
        this.sharedExpense = response.data; // Accès direct à l'objet SharedExpense
        this.statusForm.patchValue({ status: this.sharedExpense?.status });
        this.isLoading = false;
        console.log('Dépense partagée chargée avec succès:', response);
      },
      error: (error) => {
        console.error('Error loading shared expense:', error);
        this.isLoading = false;
        this.snackBar.open('Erreur lors du chargement de la dépense partagée', 'Fermer', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  // ... (le reste des méthodes reste inchangé)
  toggleEdit(): void {
    this.isEditing = !this.isEditing;
    if (!this.isEditing) {
      this.statusForm.reset({ status: this.sharedExpense?.status });
    }
  }

  confirmCancel(): void {
    if (!this.sharedExpense) return;

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Confirmer l\'annulation',
        message: `Voulez-vous vraiment annuler cette dépense partagée ? Cette action est irréversible.`,
        confirmText: 'Oui, annuler',
        cancelText: 'Non, garder'
      }
    });

    dialogRef.afterClosed().subscribe(confirmed => {
      if (confirmed) {
        this.cancelSharedExpense();
      }
    });
  }

  cancelSharedExpense(): void {
    if (!this.sharedExpense) return;

    this.isCancelling = true;
    this.sharedExpenseService.cancelSharedExpense(this.sharedExpense.id).subscribe({
      next: (response: BaseResponse) => {
        this.snackBar.open(response.message || 'Dépense annulée avec succès', 'Fermer', {
          duration: 3000,
          panelClass: ['success-snackbar']
        });
        this.sharedExpense!.status = 'CANCELLED';
        this.isCancelling = false;
      },
      error: (error) => {
        console.error('Error cancelling shared expense:', error);
        this.isCancelling = false;
        this.snackBar.open('Erreur lors de l\'annulation de la dépense', 'Fermer', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'PENDING': return 'status-pending';
      case 'COMPLETED': return 'status-completed';
      case 'CANCELLED': return 'status-cancelled';
      default: return '';
    }
  }

  formatDate(dateString: string): string {
    return this.datePipe.transform(dateString, 'dd/MM/yyyy HH:mm') || '';
  }

  calculateRemainingAmount(expense: SharedExpense): number {
    const paidAmount = expense.participants
      .filter(p => p.paymentStatus === 'PAYED')
      .reduce((sum, p) => sum + p.part, 0);
    return expense.totalAmount - paidAmount;
  }

  getParticipantStatusClass(status: string): string {
    return status === 'PAYED' ? 'status-completed' : 'status-pending';
  }
}

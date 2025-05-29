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

  updateStatus(): void {
    if (!this.sharedExpense || !this.statusForm.valid) return;

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Confirmer la modification',
        message: `Voulez-vous vraiment changer le statut en "${this.statusForm.value.status}"?`
      }
    });

    dialogRef.afterClosed().subscribe(confirmed => {
      if (confirmed) {
        this.isLoading = true;
        // Implémentez ici votre appel API pour mettre à jour le statut
        this.snackBar.open('Statut mis à jour avec succès', 'Fermer', {
          duration: 3000,
          panelClass: ['success-snackbar']
        });
        this.sharedExpense!.status = this.statusForm.value.status;
        this.isEditing = false;
        this.isLoading = false;
      }
    });
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'PENDING': return 'status-pending';
      case 'PAYED': return 'status-completed';
      case 'LATE': return 'status-cancelled';
      case 'REFUSED': return 'status-cancelled';
      default: return '';
    }
  }

  formatDate(dateString: string): string {
    return this.datePipe.transform(dateString, 'dd/MM/yyyy HH:mm') || '';
  }

  calculateRemainingAmount(expense: SharedExpense): number {
    const paidAmount = expense.participants
      .filter(p => p.paymentStatus === 'PAID')
      .reduce((sum, p) => sum + p.part, 0);
    return expense.totalAmount - paidAmount;
  }

  getParticipantStatusClass(status: string): string {
    return status === 'PAID' ? 'status-completed' : 'status-pending';
  }
}

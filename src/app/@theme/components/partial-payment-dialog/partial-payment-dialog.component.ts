import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { Debt } from 'src/app/@theme/models';

export interface PartialPaymentDialogData {
  title: string;
  debt: Debt;
  maxAmount: number;
  paymentMethod: 'card' | 'wallet';
}

@Component({
  selector: 'app-partial-payment-dialog',
  templateUrl: './partial-payment-dialog.component.html',
  styleUrls: ['./partial-payment-dialog.component.scss'],
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    FormsModule
  ]
})
export class PartialPaymentDialogComponent {
  amount: number;
  maxAmount: number;

  constructor(
    public dialogRef: MatDialogRef<PartialPaymentDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: PartialPaymentDialogData
  ) {
    this.maxAmount = data.maxAmount;
    this.amount = data.maxAmount; // Par défaut, le montant total
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onConfirm(): void {
    if (this.amount > 0 && this.amount <= this.maxAmount) {
      this.dialogRef.close({ amount: this.amount });
    }
  }

  formatAmount(amount: number): string {
    return new Intl.NumberFormat('fr-FR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount) + ' XAF';
  }

  setAmount(percentage: number): void {
    this.amount = Math.floor((this.maxAmount * percentage) / 100);
  }
}

// commission-palier.component.ts
import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatRadioModule } from '@angular/material/radio';

// Services et interfaces
import { SharedModule } from 'src/app/demo/shared/shared.module';
import { FundSubscriptionService, FundUpdate } from 'src/app/@theme/services/fundSubscription.service';
import { PageEvent } from '@angular/material/paginator';

// Interfaces pour les données de table

interface FundModel {
  id: string;
  amountXAF: number;
  amountCAD: number;
  name: string;
  annualCommission: number;
  createdAt: Date;
  updatedAt: Date;
}

@Component({
  selector: 'app-fund-model',
  templateUrl: './fund-model.component.html',
  styleUrls: ['./fund-model.component.scss'],
  imports: [
    CommonModule,
    SharedModule,
    FormsModule,
    ReactiveFormsModule,
    MatTabsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatSnackBarModule,
    MatTableModule,
    MatTooltipModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatRadioModule
  ]
})
export class FundModelComponent implements OnInit {

  // Pagination
  totalItems = 0;
  itemsPerPage = 10;
  currentPage = 1;
  filterForm: FormGroup;

  // Données pour les commissions
  fundsDataSource = new MatTableDataSource<FundModel>();
  fundsDisplayedColumns: string[] = ['name', 'amountXAF', 'amountCAD', 'annualCommission', 'actions'];

  isLoading = false;

  constructor(
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private fundSubscriptionService: FundSubscriptionService
  ) {}

  ngOnInit(): void {
    this.loadFundsModel();
  }

  // === COMMISSIONS ===
  loadFundsModel(): void {
    this.isLoading = true;
    this.fundSubscriptionService.getFundPaliers(
      this.currentPage,
      this.itemsPerPage,
    ).subscribe({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      next: (response) => {
        this.fundsDataSource.data = response.data.items;
        this.totalItems = response.data.totalItems || response.data.total;
        this.isLoading = false;
        console.log(response.data)
      },
      error: (error) => {
        console.error('Erreur chargement commissions:', error);
        this.snackBar.open('Erreur lors du chargement des commissions', 'Fermer', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
        this.isLoading = false;
      }
    });
  }

  onPageChange(event: PageEvent): void {
      this.currentPage = event.pageIndex + 1;
      this.itemsPerPage = event.pageSize;
      this.loadFundsModel();
    }

  openEditFundDialog(fund: FundModel): void {
    const dialogRef = this.dialog.open(EditFundDialogComponent, {
      width: '480px',
      data: {
        mode: 'edit',
        fund: fund
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && fund.id) {
        this.updateFund(fund.id, result);
      }
    });
  }

  updateFund(fundId: string, payload: FundUpdate): void {
    this.fundSubscriptionService.updateFundModel(fundId, payload).subscribe({
      next: () => {
        this.snackBar.open('Fond modifié avec succès', 'Fermer', {
          duration: 3000,
          panelClass: ['success-snackbar']
        });
        this.loadFundsModel();
      },
      error: (error) => {
        console.error('Erreur modification fond:', error);
        this.snackBar.open('Erreur lors de la modification du fond', 'Fermer', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  // Méthodes utilitaires
  getCommissionName(fundId: string): string {
    const fund = this.fundsDataSource.data.find(c => c.id === fundId);
    return fund ? `${fund.name} - ${fund.annualCommission} %` : 'N/A';
  }
}

// === DIALOG POUR FUND ===
@Component({
  selector: 'app-edit-fund-dialog',
  template: `
    <div class="dialog-header">
      <div class="dialog-title-section">
        <h3>
          {{ data.mode === 'create' ? 'Créer un fond de souscription' : 'Modifier le fond de souscription' }}
        </h3>
      </div>
      <button mat-icon-button (click)="onCancel()" class="close-button">
        <i class="ti ti-x"></i>
      </button>
    </div>

    <mat-dialog-content>
      <form [formGroup]="fundForm" class="commission-form">
        <!-- Type de commission -->
        <mat-form-field appearance="outline" class="w-100">
          <mat-label>Nom</mat-label>
          <input matInput type="text" formControlName="name">
          <span matPrefix>
            <i class="ti ti-currency-franc text-muted m-r-8"></i>
          </span>
        </mat-form-field>

        <!-- Montant XAF -->
        <mat-form-field appearance="outline" class="w-100">
          <mat-label>Montant XAF</mat-label>
          <input matInput type="number" formControlName="amountXAF" min="10000" step="0.01">
          <span matPrefix>
            <i class="ti ti-currency-franc text-muted m-r-8"></i>
          </span>
        </mat-form-field>

        <!-- Montant CAD -->
        <mat-form-field appearance="outline" class="w-100">
          <mat-label>Montant CAD</mat-label>
          <input matInput type="number" formControlName="amountCAD" min="100" step="0.01">
          <span matPrefix>
            <i class="ti ti-currency-franc text-muted m-r-8"></i>
          </span>
        </mat-form-field>

        <!-- Commission annuelle -->
        <mat-form-field appearance="outline" class="w-100">
          <mat-label>Commission annuelle</mat-label>
          <input matInput type="number" formControlName="annualCommission" min="5" step="0.01">
          <span matPrefix>
            <i class="ti ti-note text-muted m-r-8"></i>
          </span>
          <mat-error *ngIf="fundForm.get('annualCommission')?.hasError('required')">
            La description est obligatoire
          </mat-error>
        </mat-form-field>
      </form>
    </mat-dialog-content>

    <mat-dialog-actions align="end" class="dialog-actions">
      <button mat-stroked-button (click)="onCancel()" class="cancel-button">
        <i class="ti ti-x m-r-8"></i>
        Annuler
      </button>
      <button mat-flat-button color="primary" (click)="onSubmit()" [disabled]="!fundForm.valid" class="submit-button">
        <i class="ti ti-{{ data.mode === 'create' ? 'check' : 'edit' }} m-r-8"></i>
        {{ data.mode === 'create' ? 'Créer' : 'Modifier' }}
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .dialog-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20px 24px 0;
      border-bottom: 1px solid #e0e0e0;
      margin-bottom: 16px;
    }
    .dialog-title-section {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .dialog-icon {
      font-size: 24px;
      color: #3f51b5;
    }
    .close-button {
      color: #666;
    }
    .commission-form {
      display: flex;
      flex-direction: column;
      gap: 20px;
      padding: 8px 0;
    }
    .form-section {
      margin-bottom: 8px;
    }
    .section-label {
      display: block;
      margin-bottom: 12px;
      font-weight: 500;
      color: #333;
    }
    .radio-group {
      display: flex;
      gap: 16px;
    }
    .radio-button {
      flex: 1;
      padding: 12px;
      border: 1px solid #e0e0e0;
      border-radius: 8px;
    }
    .w-100 {
      width: 100%;
    }
    .dialog-actions {
      padding: 16px 24px 20px;
      border-top: 1px solid #e0e0e0;
      margin-top: 8px;
    }
    .cancel-button, .submit-button {
      display: flex;
      align-items: center;
    }
    .m-r-8 {
      margin-right: 8px;
    }
  `],
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MatDialogModule, MatFormFieldModule, MatInputModule, MatRadioModule, MatButtonModule, MatIconModule]
})
export class EditFundDialogComponent {
  fundForm: FormGroup;

  constructor(
    public dialogRef: MatDialogRef<EditFundDialogComponent>,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: FormBuilder
  ) {
    // ✅ DÉCLARER TOUS LES CHAMPS
    this.fundForm = this.fb.group({
      name: ['', []],
      amountXAF: [0, []],
      amountCAD: [0, []],
      annualCommission: [0, []]
    });

    // ✅ Corriger la structure data
    if (data.mode === 'edit' && data.fund) {
      const fund = data.fund;
      console.log('Fund data:', fund);
      
      this.fundForm.patchValue({
        name: fund.name || '',
        amountXAF: fund.amountXAF || 0,
        amountCAD: fund.amountCAD || 0,
        annualCommission: fund.annualCommission || 0  // ✅ Typo corrigé
      });
      console.log('Form après patchValue:', this.fundForm.value);
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSubmit(): void {
    if (this.fundForm.valid) {
      this.dialogRef.close(this.fundForm.value);
    }
  }
}

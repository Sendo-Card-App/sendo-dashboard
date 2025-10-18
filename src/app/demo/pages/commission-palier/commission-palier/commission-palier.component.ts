// commission-palier.component.ts
import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
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
import {
  MerchantService,
  CommissionPayload,
  CommissionResponse,
  PalierPayload,
  PalierResponse
} from 'src/app/@theme/services/merchant.service';
import { ConfirmDialogComponent } from 'src/app/@theme/components/confirm-dialog/confirm-dialog.component';
import { SharedModule } from 'src/app/demo/shared/shared.module';

// Interfaces pour les données de table
interface CommissionTableItem {
  id?: number;
  typeCommission: string;
  montantCommission: number;
  description: string;
  createdAt?: string;
}

interface PalierTableItem {
  id: number;
  montantMin: number;
  montantMax: number;
  commissionId: number;
  description: string;
  dateCreation?: string;
  dateMiseAJour?: string;
}

@Component({
  selector: 'app-commission-palier',
  templateUrl: './commission-palier.component.html',
  styleUrls: ['./commission-palier.component.scss'],
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
export class CommissionPalierComponent implements OnInit {
  activeTab = 0;

  // Données pour les commissions
  commissionsDataSource = new MatTableDataSource<CommissionTableItem>();
  commissionsDisplayedColumns: string[] = ['type', 'montant', 'description', 'actions'];

  // Données pour les paliers
  paliersDataSource = new MatTableDataSource<PalierTableItem>();
  paliersDisplayedColumns: string[] = ['montantMin', 'montantMax', 'commission', 'description', 'actions'];

  isLoading = false;

  constructor(
    private merchantService: MerchantService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadCommissions();
    this.loadPaliers();
  }

  // === COMMISSIONS ===
  loadCommissions(): void {
    this.isLoading = true;
    this.merchantService.getAllCommissions().subscribe({
      next: (response: any) => {
        let commissionsData: CommissionTableItem[] = [];

        if (Array.isArray(response)) {
          commissionsData = response.map(item => ({
            id: item.data?.id || item.id,
            typeCommission: item.data?.typeCommission || item.typeCommission,
            montantCommission: item.data?.montantCommission || item.montantCommission,
            description: item.data?.description || item.description,
            createdAt: item.data?.createdAt || item.createdAt
          }));
        } else if (response.data && Array.isArray(response.data)) {
          commissionsData = response.data.map((item: any) => ({
            id: item.id,
            typeCommission: item.typeCommission,
            montantCommission: item.montantCommission,
            description: item.description,
            createdAt: item.createdAt
          }));
        } else if (response.data) {
          commissionsData = [{
            id: response.data.id,
            typeCommission: response.data.typeCommission,
            montantCommission: response.data.montantCommission,
            description: response.data.description,
            createdAt: response.data.createdAt
          }];
        }

        this.commissionsDataSource.data = commissionsData;
        this.isLoading = false;
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

  openCreateCommissionDialog(): void {
    const dialogRef = this.dialog.open(CreateCommissionDialogComponent, {
      width: '480px',
      data: { mode: 'create' }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.createCommission(result);
      }
    });
  }

  openEditCommissionDialog(commission: CommissionTableItem): void {
    const dialogRef = this.dialog.open(CreateCommissionDialogComponent, {
      width: '480px',
      data: {
        mode: 'edit',
        commission: {
          data: commission
        }
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && commission.id != null) {
        this.updateCommission(commission.id, result);
      }
    });
  }

  createCommission(payload: CommissionPayload): void {
    this.merchantService.createCommission(payload).subscribe({
      next: (response) => {
        this.snackBar.open('Commission créée avec succès', 'Fermer', {
          duration: 3000,
          panelClass: ['success-snackbar']
        });
        this.loadCommissions();
      },
      error: (error) => {
        console.error('Erreur création commission:', error);
        this.snackBar.open('Erreur lors de la création de la commission', 'Fermer', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  updateCommission(id: number, payload: CommissionPayload): void {
    this.merchantService.updateCommission(id, payload).subscribe({
      next: (response) => {
        this.snackBar.open('Commission modifiée avec succès', 'Fermer', {
          duration: 3000,
          panelClass: ['success-snackbar']
        });
        this.loadCommissions();
      },
      error: (error) => {
        console.error('Erreur modification commission:', error);
        this.snackBar.open('Erreur lors de la modification de la commission', 'Fermer', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  deleteCommission(commission: CommissionTableItem): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Supprimer la commission',
        message: 'Êtes-vous sûr de vouloir supprimer cette commission ?',
        confirmText: 'Supprimer',
        cancelText: 'Annuler'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.snackBar.open('Fonctionnalité de suppression à implémenter', 'Fermer', {
          duration: 3000
        });
      }
    });
  }

  // === PALIERS ===
  loadPaliers(): void {
    this.isLoading = true;
    this.merchantService.getAllPaliers().subscribe({
      next: (response: any) => {
        let paliersData: PalierTableItem[] = [];

        if (Array.isArray(response)) {
          paliersData = response.map(item => ({
            id: item.id,
            montantMin: item.montantMin,
            montantMax: item.montantMax,
            commissionId: item.commissionId,
            description: item.description,
            dateCreation: item.dateCreation,
            dateMiseAJour: item.dateMiseAJour
          }));
        } else if (response.data && Array.isArray(response.data)) {
          paliersData = response.data.map((item: any) => ({
            id: item.id,
            montantMin: item.montantMin,
            montantMax: item.montantMax,
            commissionId: item.commissionId,
            description: item.description,
            dateCreation: item.dateCreation,
            dateMiseAJour: item.dateMiseAJour
          }));
        }

        this.paliersDataSource.data = paliersData;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erreur chargement paliers:', error);
        this.snackBar.open('Erreur lors du chargement des paliers', 'Fermer', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
        this.isLoading = false;
      }
    });
  }

  openCreatePalierDialog(): void {
    const dialogRef = this.dialog.open(CreatePalierDialogComponent, {
      width: '520px',
      data: {
        mode: 'create',
        commissions: this.commissionsDataSource.data
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.createPalier(result);
      }
    });
  }

  openEditPalierDialog(palier: PalierTableItem): void {
    const dialogRef = this.dialog.open(CreatePalierDialogComponent, {
      width: '520px',
      data: {
        mode: 'edit',
        palier: palier,
        commissions: this.commissionsDataSource.data
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.updatePalier(palier.id, result);
      }
    });
  }

  createPalier(payload: PalierPayload): void {
    this.merchantService.createPalier(payload).subscribe({
      next: (response) => {
        this.snackBar.open('Palier créé avec succès', 'Fermer', {
          duration: 3000,
          panelClass: ['success-snackbar']
        });
        this.loadPaliers();
      },
      error: (error) => {
        console.error('Erreur création palier:', error);
        this.snackBar.open('Erreur lors de la création du palier', 'Fermer', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  updatePalier(id: number, payload: PalierPayload): void {
    this.merchantService.updatePalier(id, payload).subscribe({
      next: (response) => {
        this.snackBar.open('Palier modifié avec succès', 'Fermer', {
          duration: 3000,
          panelClass: ['success-snackbar']
        });
        this.loadPaliers();
      },
      error: (error) => {
        console.error('Erreur modification palier:', error);
        this.snackBar.open('Erreur lors de la modification du palier', 'Fermer', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  deletePalier(palier: PalierTableItem): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Supprimer le palier',
        message: 'Êtes-vous sûr de vouloir supprimer ce palier ?',
        confirmText: 'Supprimer',
        cancelText: 'Annuler'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.merchantService.deletePalier(palier.id).subscribe({
          next: () => {
            this.snackBar.open('Palier supprimé avec succès', 'Fermer', {
              duration: 3000,
              panelClass: ['success-snackbar']
            });
            this.loadPaliers();
          },
          error: (error) => {
            console.error('Erreur suppression palier:', error);
            this.snackBar.open('Erreur lors de la suppression du palier', 'Fermer', {
              duration: 3000,
              panelClass: ['error-snackbar']
            });
          }
        });
      }
    });
  }

  // Méthodes utilitaires
  getCommissionName(commissionId: number): string {
    const commission = this.commissionsDataSource.data.find(c => c.id === commissionId);
    return commission ? `${commission.typeCommission} - ${commission.montantCommission}` : 'N/A';
  }

  formatMontant(commission: CommissionTableItem): string {
    if (!commission) return 'N/A';
    return commission.typeCommission === 'POURCENTAGE'
      ? `${commission.montantCommission}%`
      : `${commission.montantCommission} XAF`;
  }
}

// === DIALOG POUR COMMISSION ===
@Component({
  selector: 'app-create-commission-dialog',
  template: `
    <div class="dialog-header">
      <div class="dialog-title-section">
        <h3 mat-dialog-title>
          {{ data.mode === 'create' ? 'Créer une Commission' : 'Modifier la Commission' }}
        </h3>
      </div>
      <button mat-icon-button (click)="onCancel()" class="close-button">
        <i class="ti ti-x"></i>
      </button>
    </div>

    <mat-dialog-content>
      <form [formGroup]="commissionForm" class="commission-form">
        <!-- Type de commission -->
        <div class="form-section">
          <label class="section-label">Type de commission</label>
          <mat-radio-group formControlName="typeCommission" class="radio-group">
            <mat-radio-button value="POURCENTAGE" class="radio-button">
              <i class="ti ti-percentage m-r-8"></i>
              Pourcentage
            </mat-radio-button>
            <mat-radio-button value="FIXE" class="radio-button">
              <i class="ti ti-currency-franc m-r-8"></i>
              Montant fixe
            </mat-radio-button>
          </mat-radio-group>
        </div>

        <!-- Montant -->
        <mat-form-field appearance="outline" class="w-100">
          <mat-label>Montant</mat-label>
          <input matInput type="number" formControlName="montantCommission" min="0" step="0.01">
          <span matPrefix>
            <i class="ti ti-currency-franc text-muted m-r-8"></i>
          </span>
          <span matSuffix *ngIf="commissionForm.get('typeCommission')?.value === 'POURCENTAGE'">%</span>
          <mat-error *ngIf="commissionForm.get('montantCommission')?.hasError('required')">
            Le montant est obligatoire
          </mat-error>
          <mat-error *ngIf="commissionForm.get('montantCommission')?.hasError('min')">
            Le montant doit être positif
          </mat-error>
        </mat-form-field>

        <!-- Description -->
        <mat-form-field appearance="outline" class="w-100">
          <mat-label>Description</mat-label>
          <textarea matInput formControlName="description" rows="3" placeholder="Description de la commission..."></textarea>
          <span matPrefix>
            <i class="ti ti-note text-muted m-r-8"></i>
          </span>
          <mat-error *ngIf="commissionForm.get('description')?.hasError('required')">
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
      <button mat-flat-button color="primary" (click)="onSubmit()" [disabled]="!commissionForm.valid" class="submit-button">
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
export class CreateCommissionDialogComponent {
  commissionForm: FormGroup;

  constructor(
    public dialogRef: MatDialogRef<CreateCommissionDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: FormBuilder
  ) {
    this.commissionForm = this.fb.group({
      typeCommission: ['POURCENTAGE', Validators.required],
      montantCommission: [0, [Validators.required, Validators.min(0.01)]],
      description: ['', Validators.required]
    });

    if (data.mode === 'edit' && data.commission) {
      this.commissionForm.patchValue({
        typeCommission: data.commission.data?.typeCommission || 'POURCENTAGE',
        montantCommission: data.commission.data?.montantCommission ?? 0,
        description: data.commission.data?.description || ''
      });
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSubmit(): void {
    if (this.commissionForm.valid) {
      const value = this.commissionForm.value;
      if (value.montantCommission > 0 && value.description.trim()) {
        this.dialogRef.close(value);
      }
    }
  }
}

// === DIALOG POUR PALIER ===
@Component({
  selector: 'app-create-palier-dialog',
  template: `
    <div class="dialog-header">
      <div class="dialog-title-section">
        <i class="ti ti-{{ data.mode === 'create' ? 'layers' : 'edit' }} dialog-icon"></i>
        <h2 mat-dialog-title>
          {{ data.mode === 'create' ? 'Créer un Palier' : 'Modifier le Palier' }}
        </h2>
      </div>
      <button mat-icon-button (click)="onCancel()" class="close-button">
        <i class="ti ti-x"></i>
      </button>
    </div>

    <mat-dialog-content>
      <form class="palier-form">
        <!-- Montant Minimum -->
        <mat-form-field appearance="outline" class="w-100">
          <mat-label>Montant Minimum</mat-label>
          <input matInput type="number" [(ngModel)]="palierForm.montantMin" name="montantMin" min="0" required>
          <span matPrefix>
            <i class="ti ti-arrow-down-left text-muted m-r-8"></i>
          </span>
          <span matSuffix>XAF</span>
          <mat-error *ngIf="!palierForm.montantMin && palierForm.montantMin !== 0">
            Le montant minimum est obligatoire
          </mat-error>
        </mat-form-field>

        <!-- Montant Maximum -->
        <mat-form-field appearance="outline" class="w-100">
          <mat-label>Montant Maximum</mat-label>
          <input matInput type="number" [(ngModel)]="palierForm.montantMax" name="montantMax" min="0" required>
          <span matPrefix>
            <i class="ti ti-arrow-up-right text-muted m-r-8"></i>
          </span>
          <span matSuffix>XAF</span>
          <mat-error *ngIf="!palierForm.montantMax && palierForm.montantMax !== 0">
            Le montant maximum est obligatoire
          </mat-error>
        </mat-form-field>

        <!-- Commission -->
        <mat-form-field appearance="outline" class="w-100">
          <mat-label>Commission associée</mat-label>
          <mat-select [(ngModel)]="palierForm.commissionId" name="commissionId" required>
            <span matPrefix>
              <i class="ti ti-percentage text-muted m-r-8"></i>
            </span>
            <mat-option *ngFor="let commission of data.commissions" [value]="commission.id">
              <div class="commission-option">
                <i class="ti ti-{{ commission.typeCommission === 'POURCENTAGE' ? 'percentage' : 'currency-franc' }} m-r-8"></i>
                {{ commission.typeCommission }} - {{ commission.montantCommission }}
                {{ commission.typeCommission === 'POURCENTAGE' ? '%' : 'XAF' }}
              </div>
            </mat-option>
          </mat-select>
          <mat-error *ngIf="!palierForm.commissionId">
            La commission est obligatoire
          </mat-error>
        </mat-form-field>

        <!-- Description -->
        <mat-form-field appearance="outline" class="w-100">
          <mat-label>Description</mat-label>
          <textarea matInput [(ngModel)]="palierForm.description" name="description" rows="3"
                   placeholder="Description du palier..." required></textarea>
          <span matPrefix>
            <i class="ti ti-note text-muted m-r-8"></i>
          </span>
          <mat-error *ngIf="!palierForm.description">
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
      <button mat-flat-button color="primary" (click)="onSubmit()" [disabled]="!isFormValid()" class="submit-button">
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
    .palier-form {
      display: flex;
      flex-direction: column;
      gap: 20px;
      padding: 8px 0;
    }
    .w-100 {
      width: 100%;
    }
    .commission-option {
      display: flex;
      align-items: center;
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
  imports: [CommonModule, FormsModule, MatDialogModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatButtonModule, MatIconModule]
})
export class CreatePalierDialogComponent {
  palierForm: PalierPayload = {
    montantMin: 0,
    montantMax: 0,
    commissionId: 0,
    description: ''
  };

  constructor(
    public dialogRef: MatDialogRef<CreatePalierDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    if (data.mode === 'edit' && data.palier) {
      this.palierForm = {
        montantMin: data.palier.montantMin,
        montantMax: data.palier.montantMax,
        commissionId: data.palier.commissionId,
        description: data.palier.description
      };
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSubmit(): void {
    if (this.isFormValid()) {
      this.dialogRef.close(this.palierForm);
    }
  }

  isFormValid(): boolean {
    return this.palierForm.montantMin >= 0 &&
           this.palierForm.montantMax > this.palierForm.montantMin &&
           this.palierForm.commissionId > 0 &&
           this.palierForm.description.trim().length > 0;
  }
}

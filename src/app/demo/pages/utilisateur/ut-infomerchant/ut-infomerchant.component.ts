// ut-infomerchant.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { finalize } from 'rxjs/operators';

// Interfaces et services
import { CreditWalletRequest, MerchantItem, MerchantResponse } from 'src/app/@theme/models/merchant';
// import { AdminService } from 'src/app/@theme/services/admin.service';
import { AuthenticationService } from 'src/app/@theme/services/authentication.service';
import { ConfirmDialogComponent } from 'src/app/@theme/components/confirm-dialog/confirm-dialog.component';
import { SharedModule } from 'src/app/demo/shared/shared.module';
import { UserService } from 'src/app/@theme/services/users.service';
import { MerchantService } from 'src/app/@theme/services/merchant.service';

@Component({
  selector: 'app-ut-infomerchant',
  templateUrl: './ut-infomerchant.component.html',
  imports: [
    CommonModule,
    SharedModule,
    RouterModule,
  ],
  styleUrls: ['./ut-infomerchant.component.scss']
})
export class UtInfomerchantComponent implements OnInit {
  merchantId!: number;
  merchant!: MerchantItem;
  isLoading = false;
  currentuserRole: string[] | undefined;
  amount: number = 0;

  showCreditSection = false;
  creditAmount: number = 0;
  isCrediting = false;

  // Table des rôles
  displayedColumns: string[] = ['name', 'actions'];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  dataSource: any[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private adminService: UserService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private authentificationService: AuthenticationService,
    private merchantService: MerchantService
  ) { }

  ngOnInit(): void {
    this.currentuserRole = this.authentificationService.currentUserValue?.user.role;
    this.merchantId = Number(this.route.snapshot.paramMap.get('id'));

    if (this.merchantId) {
      this.loadMerchantDetails();
    } else {
      this.snackBar.open('ID marchand invalide', 'Fermer', { duration: 3000 });
      this.router.navigate(['/users/allmerchant']);
    }
  }

  loadMerchantDetails(): void {
    this.isLoading = true;

    this.adminService.getMerchantById(this.merchantId)
      .pipe(finalize(() => this.isLoading = false))
      .subscribe({
        next: (response: MerchantResponse) => {
          this.merchant = response.data;
          this.updateRolesTable();
          console.log('Détails du marchand:', this.merchant);
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        error: (error: any) => {
          console.error('Erreur chargement détail marchand:', error);
          this.snackBar.open('Erreur lors du chargement des détails du marchand', 'Fermer', {
            duration: 3000,
            panelClass: ['error-snackbar']
          });
          this.router.navigate(['/merchants']);
        }
      });
  }

  updateRolesTable(): void {
    if (this.merchant?.user?.roles) {
      this.dataSource = this.merchant.user.roles;
    }
  }

  // Méthodes utilitaires
  formatUserName(): string {
    if (!this.merchant?.user) return 'N/A';
    return `${this.merchant.user.firstname} ${this.merchant.user.lastname}`.trim();
  }

  getStableColor(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const h = hash % 360;
    return `hsl(${h}, 70%, 60%)`;
  }

  createStableAvatar(): { letter: string; color: string } {
    if (!this.merchant?.user) return { letter: '?', color: '#9e9e9e' };

    const firstLetter = this.merchant.user.firstname ?
      this.merchant.user.firstname.charAt(0).toUpperCase() : '?';
    return {
      letter: firstLetter,
      color: this.getStableColor(this.merchant.user.firstname + this.merchant.user.lastname)
    };
  }

  copyMatricule(): void {
    if (this.merchant?.user?.wallet?.matricule) {
      navigator.clipboard.writeText(this.merchant.user.wallet.matricule).then(() => {
        this.snackBar.open('Matricule copié !', 'Fermer', { duration: 2000 });
      });
    }
  }

  // Actions sur le portefeuille
  makeDeposit(amount: number): void {
    if (!amount || amount <= 0) {
      this.snackBar.open('Veuillez entrer un montant valide', 'Fermer', { duration: 3000 });
      return;
    }

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Confirmation de dépôt',
        message: `Êtes-vous sûr de vouloir déposer ${amount} ${this.merchant.user.wallet.currency} sur le compte de ${this.formatUserName()} ?`,
        confirmText: 'Confirmer le dépôt',
        cancelText: 'Annuler'
      }
    });

    dialogRef.afterClosed().subscribe(confirm => {
      if (confirm) {
        this.performDeposit(amount);
      }
    });
  }

  makeWithdrawal(amount: number): void {
    if (!amount || amount <= 0) {
      this.snackBar.open('Veuillez entrer un montant valide', 'Fermer', { duration: 3000 });
      return;
    }

    if (amount > (this.merchant.user.wallet.balance || 0)) {
      this.snackBar.open('Solde insuffisant', 'Fermer', { duration: 3000 });
      return;
    }

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Confirmation de retrait',
        message: `Êtes-vous sûr de vouloir retirer ${amount} ${this.merchant.user.wallet.currency} du compte de ${this.formatUserName()} ?`,
        confirmText: 'Confirmer le retrait',
        cancelText: 'Annuler'
      }
    });

    dialogRef.afterClosed().subscribe(confirm => {
      if (confirm) {
        this.performWithdrawal(amount);
      }
    });
  }

  private performDeposit(amount: number): void {
    // Implémentation du dépôt
    this.snackBar.open(`Dépôt de ${amount} ${this.merchant.user.wallet.currency} effectué`, 'Fermer', {
      duration: 3000,
      panelClass: ['success-snackbar']
    });
    // Recharger les données
    this.loadMerchantDetails();
    this.amount = 0;
  }

  private performWithdrawal(amount: number): void {
    // Implémentation du retrait
    this.snackBar.open(`Retrait de ${amount} ${this.merchant.user.wallet.currency} effectué`, 'Fermer', {
      duration: 3000,
      panelClass: ['success-snackbar']
    });
    // Recharger les données
    this.loadMerchantDetails();
    this.amount = 0;
  }

  // Actions sur les rôles
  openAddRoleDialog(): void {
    // Implémentation de l'ajout de rôle
    this.snackBar.open('Fonctionnalité d\'ajout de rôle à implémenter', 'Fermer', {
      duration: 3000
    });
  }

  onRemoveRole(): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Suppression de rôle',
        message: 'Êtes-vous sûr de vouloir supprimer ce rôle ?',
        confirmText: 'Supprimer',
        cancelText: 'Annuler'
      }
    });

    dialogRef.afterClosed().subscribe(confirm => {
      if (confirm) {
        this.performRoleRemoval();
      }
    });
  }

  private performRoleRemoval(): void {
    // Implémentation de la suppression de rôle
    this.snackBar.open('Rôle supprimé avec succès', 'Fermer', {
      duration: 3000,
      panelClass: ['success-snackbar']
    });
    this.loadMerchantDetails();
  }

  // Navigation et transactions
  viewTransactions(userId: number): void {
    this.router.navigate(['/transactions'], {
      queryParams: { userId: userId }
    });
  }

  // Vérification des permissions
  canEdit(): boolean {
    return (this.currentuserRole?.includes('SUPER_ADMIN') ?? false) ||
      (this.currentuserRole?.includes('SYSTEM_ADMIN') ?? false) ||
      (this.currentuserRole?.includes('MANAGEMENT_CONTROLLER') ?? false);
  }

  canManageWallet(): boolean {
    return (this.currentuserRole?.includes('SUPER_ADMIN') ?? false) ||
      (this.currentuserRole?.includes('SYSTEM_ADMIN') ?? false);
  }

  canManageRoles(): boolean {
    return (this.currentuserRole?.includes('SUPER_ADMIN') ?? false);
  }

  // Navigation
  goBack(): void {
    this.router.navigate(['/users/allmerchant']);
  }

  editMerchant(): void {
    if (this.canEdit()) {
      this.router.navigate(['/merchants/edit', this.merchantId]);
    }
  }


  creditWallet(): void {
  if (!this.creditAmount || this.creditAmount <= 0) {
    this.snackBar.open('Veuillez entrer un montant valide', 'Fermer', { duration: 3000 });
    return;
  }

  if (!this.merchant?.code) {
    this.snackBar.open('Code marchand non disponible', 'Fermer', { duration: 3000 });
    return;
  }

  const dialogRef = this.dialog.open(ConfirmDialogComponent, {
    width: '400px',
    data: {
      title: 'Créditer le wallet',
      message: `Êtes-vous sûr de vouloir créditer ${this.creditAmount} ${this.merchant.user.wallet.currency} sur le compte de ${this.formatUserName()} ?`,
      confirmText: 'Confirmer le crédit',
      cancelText: 'Annuler'
    }
  });

  dialogRef.afterClosed().subscribe(confirm => {
    if (confirm) {
      this.performCreditWallet();
    }
  });
}

private performCreditWallet(): void {
  this.isCrediting = true;

  const request: CreditWalletRequest = {
    merchantCode: this.merchant.code,
    amount: this.creditAmount
  };

  this.merchantService.creditWallet(request).subscribe({
    next: () => {
      this.isCrediting = false;
      this.showCreditSection = false;
      this.creditAmount = 0;

      this.snackBar.open('Wallet crédité avec succès!', 'Fermer', {
        duration: 5000,
        panelClass: ['success-snackbar']
      });

      // Recharger les données du marchand
      this.loadMerchantDetails();
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    error: (error: any) => {
      this.isCrediting = false;
      console.error('Erreur crédit wallet:', error);
      this.snackBar.open('Erreur lors du crédit du wallet: ' + (error.message || 'Erreur inconnue'), 'Fermer', {
        duration: 5000,
        panelClass: ['error-snackbar']
      });
    }
  });
}

// Ajouter cette méthode pour annuler le crédit
cancelCredit(): void {
  this.showCreditSection = false;
  this.creditAmount = 0;
}

// Ajouter cette méthode pour vérifier les permissions
canCreditWallet(): boolean {
  return (this.currentuserRole?.includes('SUPER_ADMIN') ?? false) ||
         (this.currentuserRole?.includes('SYSTEM_ADMIN') ?? false);
}
}

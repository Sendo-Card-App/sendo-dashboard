import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TontineService } from 'src/app/@theme/services/tontine.service';
import { Tontine, BaseResponse, Membre } from 'src/app/@theme/models/index';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CommonModule, DatePipe } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from 'src/app/@theme/components/confirm-dialog/confirm-dialog.component';
import { SharedModule } from 'src/app/demo/shared/shared.module';
import { AuthenticationService } from 'src/app/@theme/services/authentication.service';

@Component({
  selector: 'app-tontine-details',
  templateUrl: './tontine-details.component.html',
  styleUrls: ['./tontine-details.component.scss'],
  providers: [DatePipe],
  imports: [SharedModule, CommonModule]
})
export class TontineDetailsComponent implements OnInit {
  tontine: Tontine | null = null;
  isLoading = false;
  isSuspending = false;
  currentuserRole: string[] | undefined;

  constructor(
    private route: ActivatedRoute,
    private tontineService: TontineService,
    private snackBar: MatSnackBar,
    private datePipe: DatePipe,
    private dialog: MatDialog,
    private router: Router,
    private authentificationService: AuthenticationService
  ) { }

  ngOnInit(): void {
    this.currentuserRole = this.authentificationService.currentUserValue?.user.role;
    this.loadTontine();
  }

  loadTontine(): void {
    this.isLoading = true;
    const id = this.route.snapshot.params['id'];

    this.tontineService.getTontineById(id).subscribe({
      next: (response: BaseResponse<Tontine>) => {
        this.tontine = response.data;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading tontine:', error);
        this.snackBar.open('Erreur lors du chargement de la tontine', 'Fermer', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
        this.isLoading = false;
      }
    });
  }

  confirmSuspend(): void {
    if (!this.tontine) return;

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Confirmer la suspension',
        message: `Voulez-vous vraiment ${this.tontine.etat === 'ACTIVE' ? 'suspendre' : 'réactiver'} cette tontine ?`,
        confirmText: 'Confirmer',
        cancelText: 'Annuler'
      }
    });

    dialogRef.afterClosed().subscribe(confirmed => {
      if (confirmed) {
        this.toggleTontineStatus();
      }
    });
  }

  toggleTontineStatus(): void {
    if (!this.tontine) return;

    this.isSuspending = true;
    const newStatus = this.tontine.etat === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';

    setTimeout(() => {
      if (this.tontine) {
        this.tontine.etat = newStatus;
        this.snackBar.open(`Tontine ${newStatus === 'ACTIVE' ? 'réactivée' : 'suspendue'} avec succès`, 'Fermer', {
          duration: 3000,
          panelClass: ['success-snackbar']
        });
      }
      this.isSuspending = false;
    }, 1000);
  }

  formatDate(date: string): string {
    return this.datePipe.transform(date, 'dd/MM/yyyy HH:mm') || '';
  }

  formatCurrency(amount: number): string {
    return amount.toLocaleString('fr-FR', { style: 'currency', currency: 'XAF' });
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'ACTIVE': return 'status-active';
      case 'SUSPENDED': return 'status-inactive';
      case 'PENDING': return 'status-pending';
      default: return '';
    }
  }

  getRotationOrder(): number[] {
    if (!this.tontine?.ordreRotation) return [];
    try {
      console.log('Rotation Order:', this.tontine.ordreRotation);
      return JSON.parse(this.tontine.ordreRotation);
    } catch {
      console.error('Error parsing rotation order:', this.tontine.ordreRotation);
      return [];
    }
  }

  getMemberById(memberId: number): string {
    if (!this.tontine?.membres) return '';
    const member = this.tontine.membres.find(m => m.id === memberId);
    return member?.user ? `${member.user.firstname} ${member.user.lastname}` : `Membre #${memberId}`;
  }


  calculateTotalContributions(): number {
    if (!this.tontine) return 0;
    return this.tontine.cotisations
      .filter(c => c.statutPaiement === 'VALIDATED')
      .reduce((sum, c) => sum + c.montant, 0);
  }
  // Ajoutez ces méthodes à votre composant existant

  getTontineColor(tontine: Tontine): string {
    const colors = [
      '#3498db', '#e74c3c', '#2ecc71', '#f39c12',
      '#9b59b6', '#1abc9c', '#d35400', '#34495e'
    ];
    const index = tontine.nom.charCodeAt(0) % colors.length;
    return colors[index];
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getMemberColor(member: any): string {
    const name = member.user.firstname + member.user.lastname;
    const colors = [
      '#3498db', '#e74c3c', '#2ecc71', '#f39c12',
      '#9b59b6', '#1abc9c', '#d35400', '#34495e'
    ];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  }

  copyInvitationCode(): void {
    navigator.clipboard.writeText(this.tontine!.invitationCode);
    this.snackBar.open('Code copié dans le presse-papier', 'Fermer', {
      duration: 3000
    });
  }

  toggleSuspend(): void {
    if (!this.tontine) return;

    const newStatus = this.tontine.etat === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    const action = newStatus === 'ACTIVE' ? 'réactiver' : 'suspendre';

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Confirmer la modification',
        message: `Voulez-vous vraiment ${action} cette tontine ?`,
        confirmText: 'Confirmer',
        cancelText: 'Annuler'
      }
    });

    dialogRef.afterClosed().subscribe(confirmed => {
      if (confirmed) {
        this.isSuspending = true;

        this.tontineService.updateTontineStatus(this.tontine!.id, newStatus)
          .subscribe({
            next: () => {
              this.tontine!.etat = newStatus;
              this.snackBar.open(`Tontine ${action} avec succès`, 'Fermer', {
                duration: 3000,
                panelClass: ['success-snackbar']
              });
              this.isSuspending = false;
            },
            error: (error) => {
              console.error('Error updating tontine status:', error);
              this.snackBar.open(`Erreur lors de la ${action} de la tontine`, 'Fermer', {
                duration: 3000,
                panelClass: ['error-snackbar']
              });
              this.isSuspending = false;
            }
          });
      }
    });
  }

  makeDeposit(montant: number) {
    this.tontineService.deposit(this.tontine!.id, montant).subscribe({
      next: () => {
        this.snackBar.open('Dépôt réussi', 'Fermer', { duration: 3000 });
        this.loadTontine();
      },
      error: (err) => {
        this.snackBar.open(`Erreur lors du dépôt: ${err.error?.message || err.message}`, 'Fermer', { duration: 5000 });
      }
    });
  }

  makeWithdrawal(montant: number) {
    this.tontineService.withdraw(this.tontine!.id, montant).subscribe({
      next: () => {
        this.snackBar.open('Retrait réussi', 'Fermer', { duration: 3000 });
        this.loadTontine();
      },
      error: (err) => {
        this.snackBar.open(`Erreur lors du retrait: ${err.error?.message || err.message}`, 'Fermer', { duration: 5000 });
      }
    });
  }

  viewMemberContributions(member: Membre): void {
    this.router.navigate(
      ['/tontines', this.tontine!.id, 'members'],
      {
        queryParams: {
          membreId: member.id,
          statutPaiement: 'VALIDATED'
        }
      }
    );


  }
}

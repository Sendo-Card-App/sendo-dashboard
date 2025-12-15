import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from 'src/app/demo/shared/shared.module';
import { ActivatedRoute, Router } from '@angular/router';
import { MeResponse, RemoveRoleRequest } from 'src/app/@theme/models';
import { UserService } from 'src/app/@theme/services/users.service';
import { RoleAddComponent } from './roles-add/role-add.component';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { AdminService } from 'src/app/@theme/services/admin.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthenticationService } from 'src/app/@theme/services/authentication.service';

@Component({
  selector: 'app-ut-infouser',
  standalone: true,
  imports: [CommonModule, SharedModule],
  templateUrl: './ut-infouser.component.html',
  styleUrls: ['./ut-infouser.component.scss']
})
export class UtInfouserComponent implements OnInit {
  user?: MeResponse;
  isLoading = false;
  errorMessage = '';
  dataSource = new MatTableDataSource();
  displayedColumns: string[] = ['name', 'actions'];
  currentuserRole: string[] | undefined;
  amount: number | null = null;
  numeroIdentification: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private userService: UserService,
    private dialog: MatDialog,
    private adminService: AdminService,
    private snackBar: MatSnackBar,
    private router: Router,
    private authentificationService: AuthenticationService
  ) {}

  ngOnInit(): void {
    this.currentuserRole = this.authentificationService.currentUserValue?.user.role;

    //console.log('Rôle utilisateur courant:', this.currentuserRole);
    const idParam = this.route.snapshot.paramMap.get('id');
    if (!idParam) {
      this.errorMessage = 'Aucun identifiant fourni';
      return;
    }

    const userId = Number(idParam);
    this.isLoading = true;

    this.userService.getUserById(userId).subscribe({
      next: resp => {
        this.user = resp.data;
        console.log('Utilisateur récupéré:', this.user);
        if (this.user?.user.roles) {
          this.dataSource.data = this.user.user.roles;
        }
        this.isLoading = false;
      },
      error: err => {
        this.errorMessage = err.message || 'Erreur de chargement';
        this.isLoading = false;
      }
    });
  }

  getStatusText(status: string): string {
    switch (status) {
      case 'APPROVED': return 'Approuvé';
      case 'REJECTED': return 'Rejeté';
      case 'PENDING': return 'En attente';
      default: return 'Inconnu';
    }
  }
  
  /** Calcule une couleur stable à partir du nom */
  private getStableColor(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const h = Math.abs(hash) % 360;
    return `hsl(${h}, 70%, 60%)`;
  }

  /** Retourne la première lettre + couleur */
  createStableAvatar(user?: MeResponse['user']): { letter: string; color: string } | null {
    if (!user) return null;

    const letter = (user.firstname?.charAt(0)?.toUpperCase() || '?');
    const name = (user.firstname || '') + (user.lastname || '');

    return {
      letter,
      color: this.getStableColor(name)
    };
  }

  /** Copie le matricule du wallet dans le presse-papier */
  copyMatricule(): void {
    if (!this.user?.user.wallet?.matricule) { return; }
    navigator.clipboard.writeText(this.user.user.wallet.matricule)
      .catch(() => {/* silently fail */});
  }

  openAddRoleDialog(user: MeResponse['user']): void {
    if (!user) return;
    // console.log('Ouverture du dialogue d\'ajout de rôle pour l\'utilisateur', user);

    const dialogRef = this.dialog.open(RoleAddComponent, {
      width: '450px',
      data: { user }
    });

    dialogRef.afterClosed().subscribe(success => {
      if (success) {
        // Recharger les données utilisateur
        this.ngOnInit();
      }
    });
  }

  onRemoveRole(userId: number, roleId: number): void {
    const request: RemoveRoleRequest = { userId, roleId };

    this.adminService.removeUserRole(request).subscribe({
      next: () => {
        // console.log('Rôle retiré:', response);
        this.snackBar.open('Rôle supprimer avec succes', 'Fermer', { duration: 3000 });
        this.ngOnInit(); // Actualiser les données
      },
      error: (error) => {
        console.error('Erreur:', error);
        this.snackBar.open('Erreur lors de la suppression', 'Fermer', { duration: 3000 });
      }
    });
  }

  viewTransactions(transactionId: number): void {
    this.router.navigate(['/transactions/user', transactionId]);
  }

  makeDeposit(amount: number) {
    this.userService.deposit(this.user!.user.wallet.matricule, amount).subscribe({
      next: () => {
        this.snackBar.open('Recharge réussie', 'Fermer', { duration: 3000 });
        this.ngOnInit();
      },
      error: err => {
        console.error('Erreur recharge', err);
        this.snackBar.open('Erreur lors de la recharge', 'Fermer', { duration: 3000 });
      }
    });
  }

  saveIdentificationNumber(numberIdentification: string) {
    if (!this.user) return;
    this.userService.saveIdentificationNumber(this.user.user.id, numberIdentification).subscribe({
      next: () => {
        this.numeroIdentification = null;
        this.snackBar.open("NIU enregistré avec succès", 'Fermer', { duration: 3000 });
        this.ngOnInit();
      },
      error: err => {
        console.error("Erreur d'enregistrement numéro identification", err);
        this.snackBar.open("Erreur lors de l'enregistrement du numéro identification", 'Fermer', { duration: 3000 });
      }
    });
  }

  makeWithdrawal(amount: number) {
    this.userService.withdraw(this.user!.user!.wallet.matricule, amount).subscribe({
      next: () => {
        this.amount = null;
        this.snackBar.open('Retrait réussi', 'Fermer', { duration: 3000 });
        this.ngOnInit();
      },
      error: err => {
        console.error('Erreur retrait', err);
        this.snackBar.open('Erreur lors du retrait', 'Fermer', { duration: 3000 });
      }
    });
  }
}

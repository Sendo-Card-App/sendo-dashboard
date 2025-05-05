import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from 'src/app/demo/shared/shared.module';
import { ActivatedRoute } from '@angular/router';
import { MeResponse, RoleUser } from 'src/app/@theme/models';
import { UserService } from 'src/app/@theme/services/users.service';
import { RoleAddComponent } from './roles-add/role-add.component';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';

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

  constructor(
    private route: ActivatedRoute,
    private userService: UserService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
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
        if (this.user?.roles) {
          this.dataSource.data = this.user.roles;
        }
        this.isLoading = false;
      },
      error: err => {
        this.errorMessage = err.message || 'Erreur de chargement';
        this.isLoading = false;
      }
    });
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
  createStableAvatar(user?: MeResponse): { letter: string; color: string } | null {
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
    if (!this.user?.wallet?.matricule) { return; }
    navigator.clipboard.writeText(this.user.wallet.matricule)
      .catch(() => {/* silently fail */});
  }

  openAddRoleDialog(user: MeResponse): void {
    if (!user) return;
    console.log('Ouverture du dialogue d\'ajout de rôle pour l\'utilisateur', user);

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

  deleteRole(roleId: number): void {
    // Implémentez la logique de suppression ici
    console.log('Suppression du rôle', roleId);
  }
}

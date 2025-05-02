import { Component, OnInit } from '@angular/core';
import { CommonModule }      from '@angular/common';
import { SharedModule }      from 'src/app/demo/shared/shared.module';
import { ActivatedRoute }    from '@angular/router';
import { MeResponse } from 'src/app/@theme/models';
import { UserService }       from 'src/app/@theme/services/users.service';

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

  constructor(
    private route: ActivatedRoute,
    private userService: UserService
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
        // Si votre service wrappe dans { data: MeResponse }, faites resp.data
        this.user = resp.data;
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
  createStableAvatar(user: MeResponse): { letter: string; color: string } {
    // si firstname est vide, on tombe sur '?'
    const letter = (user.firstname.charAt(0).toUpperCase() || '?');

    // concaténation simple : toujours une string
    const name = user.firstname + user.lastname;

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
}

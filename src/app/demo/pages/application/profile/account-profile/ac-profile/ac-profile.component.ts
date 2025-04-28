import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from 'src/app/demo/shared/shared.module';

@Component({
  selector: 'app-ac-profile',
  standalone: true,
  imports: [CommonModule, SharedModule],
  templateUrl: './ac-profile.component.html',
  styleUrls: ['../account-profile.scss', './ac-profile.component.scss']
})
export class AcProfileComponent {
  userData: any = null; // Initialisation explicite
  userRoles: string = '';
  contactInfos: any[] = [];
  personalDetails: any[] = [];

  constructor() {
    this.loadUserData();
    this.initContactInfos();
    this.initPersonalDetails();
  }

  private loadUserData(): void {
    const storedData = localStorage.getItem('user-info');
    if (storedData) {
      this.userData = JSON.parse(storedData);
      this.userRoles = this.userData.roles.map((role: any) => role.name).join(', ');
      // Re-initialiser les tableaux après chargement des données
      this.initContactInfos();
      this.initPersonalDetails();
    }
  }

  private initContactInfos(): void {
    this.contactInfos = [
      {
        icon: 'ti ti-mail',
        text: this.userData?.email || 'Non renseigné'
      },
      {
        icon: 'ti ti-phone',
        text: this.userData?.phone || 'Non renseigné'
      },
      {
        icon: 'ti ti-map-pin',
        text: this.userData?.address || 'Non renseigné'
      }
    ];
  }

  private initPersonalDetails(): void {
    this.personalDetails = [
      {
        group: 'Prénom',
        text: this.userData?.firstname || 'Non renseigné',
        group_2: 'Nom',
        text_2: this.userData?.lastname || 'Non renseigné'
      },
      {
        group: 'Profession',
        text: this.userData?.profession || 'Non renseigné',
        group_2: 'Ville',
        text_2: this.userData?.city || 'Non renseigné'
      },
      {
        group: 'Région',
        text: this.userData?.region || 'Non renseigné',
        group_2: 'District',
        text_2: this.userData?.district || 'Non renseigné'
      }
    ];
  }
}

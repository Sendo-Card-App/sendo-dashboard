import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from 'src/app/demo/shared/shared.module';
import { MeResponse } from 'src/app/@theme/models';

interface Role {
  id: number;
  name: string;
}

interface ContactInfo {
  icon: string;
  text: string;
}

interface PersonalDetail {
  group: string;
  text: string;
  group_2: string;
  text_2: string;
}

@Component({
  selector: 'app-ac-profile',
  standalone: true,
  imports: [CommonModule, SharedModule],
  templateUrl: './ac-profile.component.html',
  styleUrls: ['../account-profile.scss', './ac-profile.component.scss']
})
export class AcProfileComponent {
  userData: MeResponse | null = null;
  userRoles = '';
  contactInfos: ContactInfo[] = [];
  personalDetails: PersonalDetail[] = [];

  constructor() {
    this.loadUserData();
  }

  private loadUserData(): void {
    const stored = localStorage.getItem('user-info');
    if (!stored) { return; }

    // cast the parsed JSON to UserData
    this.userData = JSON.parse(stored) as MeResponse;
    // now TypeScript knows roles is Role[]
    this.userRoles = this.userData.roles.map(r => r.name).join(', ');

    this.initContactInfos();
    this.initPersonalDetails();
  }

  private initContactInfos(): void {
    this.contactInfos = [
      { icon: 'ti ti-mail', text: this.userData?.email ?? 'Non renseigné' },
      { icon: 'ti ti-phone', text: this.userData?.phone ?? 'Non renseigné' },
      { icon: 'ti ti-map-pin', text: this.userData?.address ?? 'Non renseigné' }
    ];
  }

  private initPersonalDetails(): void {
    this.personalDetails = [
      {
        group: 'Prénom', text: this.userData?.firstname ?? 'Non renseigné',
        group_2: 'Nom', text_2: this.userData?.lastname ?? 'Non renseigné'
      },
      {
        group: 'Profession', text: this.userData?.profession ?? 'Non renseigné',
        group_2: 'Ville', text_2: this.userData?.city ?? 'Non renseigné'
      },
      {
        group: 'Région', text: this.userData?.region ?? 'Non renseigné',
        group_2: 'District', text_2: this.userData?.district ?? 'Non renseigné'
      }
    ];
  }
}

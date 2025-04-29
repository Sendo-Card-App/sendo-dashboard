import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from 'src/app/demo/shared/shared.module';
import { MeResponse } from 'src/app/@theme/models';
import { UserService } from 'src/app/@theme/services/users.service';
import { MatSnackBar } from '@angular/material/snack-bar';

interface ContactInfo {
  icon: string;
  text: string;
  editable: boolean;
  fieldName?: keyof MeResponse;
}

interface PersonalDetail {
  group: string;
  text: string;
  editable: boolean;
  fieldName?: keyof MeResponse;
  group_2: string;
  text_2: string;
  editable_2: boolean;
  fieldName_2?: keyof MeResponse;
}

@Component({
  selector: 'app-ac-profile',
  standalone: true,
  imports: [CommonModule, SharedModule, FormsModule, ReactiveFormsModule],
  templateUrl: './ac-profile.component.html',
  styleUrls: ['../account-profile.scss', './ac-profile.component.scss']
})
export class AcProfileComponent {
  userData: MeResponse | null = null;
  userRoles = '';
  contactInfos: ContactInfo[] = [];
  personalDetails: PersonalDetail[] = [];
  isEditing = false;
  loading = false;

  constructor(
    private userService: UserService,
    private snackBar: MatSnackBar
  ) {
    this.loadUserData();
  }

  private loadUserData(): void {
    const stored = localStorage.getItem('user-info');
    if (!stored) { return; }

    this.userData = JSON.parse(stored) as MeResponse;
    this.updateDisplayData();
  }

  private updateDisplayData(): void {
    if (!this.userData) return;

    this.userRoles = this.userData.roles?.map(r => r.name).join(', ') || '';
    this.initContactInfos();
    this.initPersonalDetails();
  }

  private initContactInfos(): void {
    this.contactInfos = [
      {
        icon: 'ti ti-mail',
        text: this.userData?.email ?? 'Non renseigné',
        editable: false
      },
      {
        icon: 'ti ti-phone',
        text: this.userData?.phone ?? 'Non renseigné',
        editable: false
      },
      {
        icon: 'ti ti-map-pin',
        text: this.userData?.address ?? 'Non renseigné',
        editable: true,
        fieldName: 'address'
      }
    ];
  }

  private initPersonalDetails(): void {
    this.personalDetails = [
      {
        group: 'Prénom',
        text: this.userData?.firstname ?? 'Non renseigné',
        editable: true,
        fieldName: 'firstname',
        group_2: 'Nom',
        text_2: this.userData?.lastname ?? 'Non renseigné',
        editable_2: true,
        fieldName_2: 'lastname'
      },
      {
        group: 'Profession',
        text: this.userData?.profession ?? 'Non renseigné',
        editable: true,
        fieldName: 'profession',
        group_2: 'Ville',
        text_2: this.userData?.city ?? 'Non renseigné',
        editable_2: true,
        fieldName_2: 'city'
      },
      {
        group: 'Région',
        text: this.userData?.region ?? 'Non renseigné',
        editable: true,
        fieldName: 'region',
        group_2: 'District',
        text_2: this.userData?.district ?? 'Non renseigné',
        editable_2: true,
        fieldName_2: 'district'
      }
    ];
  }

  toggleEdit(): void {
    this.isEditing = !this.isEditing;
  }

  saveChanges(): void {
    if (!this.userData) return;

    this.loading = true;

    // Préparer seulement les données modifiables à envoyer
    const updateData = {
      firstname: this.userData.firstname,
      lastname: this.userData.lastname,
      address: this.userData.address,
      profession: this.userData.profession,
      city: this.userData.city,
      region: this.userData.region,
      district: this.userData.district
    };

    this.userService.updateUser(this.userData.id, updateData)
      .subscribe({
        next: (response) => {
          // Fusionner les nouvelles données avec les données existantes
          const currentData: MeResponse = JSON.parse(localStorage.getItem('user-info') || '{}');
          const updatedData = { ...currentData, ...response.data };

          localStorage.setItem('user-info', JSON.stringify(updatedData));
          this.userData = updatedData;
          this.updateDisplayData();

          this.snackBar.open(response.message, 'Fermer', { duration: 3000 });
          this.isEditing = false;
        },
        error: (error) => {
          this.snackBar.open(
            error.error?.message || 'Erreur lors de la mise à jour',
            'Fermer',
            { duration: 3000 }
          );
        },
        complete: () => {
          this.loading = false;
        }
      });
  }
}

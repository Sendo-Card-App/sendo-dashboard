import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { UserService } from 'src/app/@theme/services/users.service';
import { MeResponse } from 'src/app/@theme/models';
import { CommonModule } from '@angular/common';
import { SharedModule } from 'src/app/demo/shared/shared.module';

// Interfaces
export interface RolePayload {
  id: number;
  name: string;
}

export interface UserUpdatePayload {
  firstname: string;
  lastname: string;
  address?: string;
  profession?: string | null;
  region?: string | null;
  city?: string | null;
  district?: string | null;
}

@Component({
  selector: 'app-ut-updateuser',
  imports: [CommonModule, SharedModule],
  templateUrl: './ut-updateuser.component.html',
  styleUrls: ['./ut-updateuser.component.scss']
})
export class UtUpdateuserComponent implements OnInit {
  userForm: FormGroup;
  userId: number;
  isLoading = false;
  isSubmitting = false;
  userRoles: RolePayload[] = [];

  constructor(
    private userService: UserService,
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.userForm = new FormGroup({
      firstname: new FormControl('', [Validators.required]),
      lastname: new FormControl('', [Validators.required]),
      // Email non modifiable mais affiché
      email: new FormControl({value: '', disabled: true}),
      phone: new FormControl({value: '', disabled: true}),
      address: new FormControl(''),
      profession: new FormControl(null),
      region: new FormControl(null),
      city: new FormControl(null),
      district: new FormControl(null),
      // Wallet info (affichage seulement)
      walletBalance: new FormControl({value: '', disabled: true}),
      walletCurrency: new FormControl({value: '', disabled: true}),
    });
  }

  ngOnInit(): void {
    this.userId = +this.route.snapshot.params['id'];
    this.loadUserData();
  }

  loadUserData(): void {
    this.isLoading = true;
    this.userService.getUserById(this.userId).subscribe({
      next: (response) => {
        if (response.data) {
          this.populateForm(response.data);
          this.userRoles = response.data.roles;
        }
        this.isLoading = false;
      },
      error: () => {
        this.snackBar.open('Échec du chargement des données utilisateur', 'Fermer', { duration: 3000 });
        this.isLoading = false;
      }
    });
  }

  populateForm(userData: MeResponse): void {
    this.userForm.patchValue({
      firstname: userData.firstname,
      lastname: userData.lastname,
      email: userData.email,
      phone: userData.phone,
      address: userData.address,
      profession: userData.profession,
      region: userData.region,
      city: userData.city,
      district: userData.district,
      walletBalance: userData.wallet?.balance || 0,
      walletCurrency: userData.wallet?.currency || 'USD'
    });
  }

  onSubmit(): void {
    if (this.userForm.invalid) {
      this.userForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    const formData = this.userForm.value;

    const userUpdateData: UserUpdatePayload = {
      firstname: formData.firstname,
      lastname: formData.lastname,
      address: formData.address || null,
      profession: formData.profession || null,
      region: formData.region || null,
      city: formData.city || null,
      district: formData.district || null
    };

    this.userService.updateUserById(this.userId, userUpdateData).subscribe({
      next: () => {
        this.snackBar.open('Utilisateur mis à jour avec succès', 'Fermer', { duration: 3000 });
        this.isSubmitting = false;
      },
      error: (err) => {
        this.snackBar.open(err.message || 'Échec de la mise à jour', 'Fermer', { duration: 3000 });
        this.isSubmitting = false;
      }
    });
  }

  onCancel(): void {
    this.router.navigate(['/users']);
  }
}

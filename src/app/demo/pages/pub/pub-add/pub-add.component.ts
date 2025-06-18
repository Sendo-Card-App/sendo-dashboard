import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { PubAdminService } from 'src/app/@theme/services/pub-admin.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SharedModule } from 'src/app/demo/shared/shared.module';

@Component({
  selector: 'app-pub-add',
  templateUrl: './pub-add.component.html',
  styleUrls: ['./pub-add.component.scss'],
  imports: [CommonModule, SharedModule]
})
export class PubAddComponent {
  isLoading = false;
  pubForm: FormGroup;
  selectedFile: File | null = null;
  previewUrl: string | ArrayBuffer | null = null;

  constructor(
    private fb: FormBuilder,
    private pubService: PubAdminService,
    private snackBar: MatSnackBar,
    private router: Router
  ) {
    this.pubForm = this.fb.group({
      name: ['', Validators.required],
      description: [''],
      price: [0, [Validators.min(0)]],
      link: ['', Validators.pattern('https?://.+')],
      isActive: [true]
    });
  }

 onFileSelected(event: Event): void {
  const input = event.target as HTMLInputElement;
  if (input.files && input.files.length > 0) {
    this.selectedFile = input.files[0];
    console.log('Fichier sélectionné :', this.selectedFile); // 👈

    // Preview
    const reader = new FileReader();
    reader.onload = () => {
      this.previewUrl = reader.result;
    };
    reader.readAsDataURL(this.selectedFile);
  }
}


  removeImage(): void {
    this.selectedFile = null;
    this.previewUrl = null;
  }

  onSubmit(): void {
    if (this.pubForm.invalid || !this.selectedFile) {
      this.snackBar.open('Veuillez remplir tous les champs requis et sélectionner une image', 'Fermer', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
      return;
    }

    this.isLoading = true;

    // Créer un FormData pour envoyer le fichier
    const formData = new FormData();
    formData.append('file', this.selectedFile );
    formData.append('name', this.pubForm.value.name);
    formData.append('description', this.pubForm.value.description);
    formData.append('price', this.pubForm.value.price.toString());
    formData.append('link', this.pubForm.value.link);
    console.log('FormData:'); // 👈 Pour vérifier le contenu de FormData

formData.forEach((value, key) => {
  console.log(`${key}:`, value);
});


    this.pubService.createPublicite(formData).subscribe({
  next: () => {
    this.snackBar.open('Publicité créée avec succès', 'Fermer', {
      duration: 3000,
      panelClass: ['success-snackbar']
    });
    this.router.navigate(['/publicites/all']);
  },
  error: (error) => {
    // 🐞 Affiche l'objet d'erreur brut
    console.error('Erreur HTTP complète :', error.error);

    // 🐞 Affiche le message réel retourné par le backend s’il est présent
    if (error.error) {
      console.error('Message serveur :', error.error.message || error.error);
    }

    this.snackBar.open(
      error.error?.message || 'Erreur lors de la création',
      'Fermer',
      {
        duration: 3000,
        panelClass: ['error-snackbar']
      }
    );
    this.isLoading = false;
  }
});

  }
}

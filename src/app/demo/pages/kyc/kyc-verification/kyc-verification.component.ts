import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { KycDocumentType, KycDocumentUpload, KycService } from 'src/app/@theme/services/kyc.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthenticationService } from 'src/app/@theme/services/authentication.service';
import { User } from 'src/app/@theme/types/user';
import { ActivatedRoute, Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';

interface KycDocument {
  id: number;
  type: KycDocumentType;
  typeAccount?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  url: string;
  publicId: string;
  idDocumentNumber?: string | null;
  taxIdNumber?: string | null;
  rejectionReason?: string | null;
  reviewedById?: number | null;
  userId: number;
  createdAt?: string;
  updatedAt?: string;
}

interface KycStep {
  id: KycDocumentType;
  title: string;
  description: string;
  icon: string;
  completed: boolean;
  files: File[];
  isUploading: boolean;
  uploadSuccess: boolean;
  submittedDocuments?: KycDocument[];
  canSubmit: boolean;
  status?: 'PENDING' | 'APPROVED' | 'REJECTED';
  rejectionReason?: string | null;
  idDocumentNumber?: string;
  taxIdNumber?: string;
  expirationDate?: string;
  isRequiredForCanadian: boolean;
  isRequiredForCameroonian: boolean;
}

@Component({
  selector: 'app-kyc-verification',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatProgressBarModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatDatepickerModule,
    MatNativeDateModule
  ],
  templateUrl: './kyc-verification.component.html',
  styleUrls: ['./kyc-verification.component.scss']
})
export class KycVerificationComponent implements OnInit {
  currentStep = 0;
  progress = 0;
  allDocumentsSubmitted = false;
  hasRejectedDocuments = false;
  userKycDocuments: KycDocument[] = [];
  user: User['user'] | null = null;
  userId: number;
  isCanadian = false;

  requiredDocumentsCanadian = ['ID_PROOF', 'ID_PROOF', 'SELFIE'];
  requiredDocumentsCameroonian = ['ID_PROOF', 'ID_PROOF', 'ADDRESS_PROOF', 'SELFIE'];

  kycSteps: KycStep[] = [
    {
      id: 'ID_PROOF',
      title: 'Pièce d\'identité (Recto/Verso)',
      description: 'Téléchargez recto ET verso + renseignez les informations obligatoires.',
      icon: 'badge',
      completed: false,
      files: [],
      isUploading: false,
      uploadSuccess: false,
      submittedDocuments: [],
      canSubmit: true,
      idDocumentNumber: '',
      expirationDate: '',
      taxIdNumber: '',
      isRequiredForCanadian: true,
      isRequiredForCameroonian: true
    },
    {
      id: 'ADDRESS_PROOF',
      title: 'Justificatif de domicile',
      description: 'Upload d\'un plan de localisation et capture de Google Maps',
      icon: 'home',
      completed: false,
      files: [],
      isUploading: false,
      uploadSuccess: false,
      submittedDocuments: [],
      canSubmit: true,
      idDocumentNumber: '',
      isRequiredForCanadian: false,
      isRequiredForCameroonian: true
    },
    {
      id: 'SELFIE',
      title: 'Selfie de vérification',
      description: 'Photo tenant votre pièce d\'identité à côté du visage.',
      icon: 'face',
      completed: false,
      files: [],
      isUploading: false,
      uploadSuccess: false,
      submittedDocuments: [],
      canSubmit: true,
      idDocumentNumber: '',
      isRequiredForCanadian: true,
      isRequiredForCameroonian: true
    }
  ];

  constructor(
    private route: ActivatedRoute,
    private kycService: KycService,
    private snackbar: MatSnackBar,
    private authService: AuthenticationService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('userId');
      if (id) {
        this.userId = +id;
        this.loadUserKycDocuments();
      } else {
        this.router.navigate(['/users/alluser']);
      }
    });
  }

  loadUserKycDocuments(): void {
    this.authService.getUserById(this.userId).subscribe({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      next: (response: any) => {
        if (response.data?.user) {
          this.user = response.data.user;
          this.isCanadian = this.user?.country === 'Canada';
          this.updateStepsVisibility();

          if (this.user && this.user.kycDocuments) {
            this.userKycDocuments = this.user.kycDocuments;
            this.updateStepsWithExistingDocuments();
          } else {
            this.calculateProgress();
          }
        } else {
          this.calculateProgress();
        }
      },
      error: (error) => {
        console.error('Erreur chargement documents KYC:', error);
        this.calculateProgress();
      }
    });
  }

  updateStepsVisibility(): void {
    const addressStep = this.kycSteps.find(step => step.id === 'ADDRESS_PROOF');
    if (addressStep) {
      addressStep.canSubmit = !this.isCanadian;
    }
  }

  updateStepsWithExistingDocuments(): void {
    this.hasRejectedDocuments = false;
    this.kycSteps.forEach(step => {
      const existingDoc = this.userKycDocuments.find(doc => doc.type === step.id);
      if (existingDoc) {
        step.submittedDocuments = [existingDoc];
        step.status = existingDoc.status;
        step.rejectionReason = existingDoc.rejectionReason;
        step.idDocumentNumber = existingDoc.idDocumentNumber || '';

        if (existingDoc.status === 'PENDING' || existingDoc.status === 'APPROVED') {
          step.completed = true;
          step.canSubmit = false;
        } else if (existingDoc.status === 'REJECTED') {
          step.completed = false;
          step.canSubmit = true;
          this.hasRejectedDocuments = true;
        }
      }
    });
    this.calculateProgress();
  }

  calculateProgress(): void {
    const requiredSteps = this.isCanadian ? 3 : 4;
    const completedSteps = this.kycSteps.filter(step => 
      step.completed && step.canSubmit !== false
    ).length;
    this.progress = Math.round((completedSteps / requiredSteps) * 100);
    this.allDocumentsSubmitted = this.progress === 100;
  }

  // ✅ UPLOAD GLOBAL - TOUS DOCUMENTS
  async uploadAllDocuments(): Promise<void> {
    try {
      const requiredCount = this.isCanadian ? 3 : 4;
      const readyCount = this.readyDocumentsCount;

      if (readyCount < requiredCount) {
        this.snackbar.open(
          `Complétez ${requiredCount - readyCount} étape(s) avant envoi`, 
          'Fermer'
        );
        return;
      }

      this.kycSteps.forEach(step => {
        if (step.canSubmit && step.files.length > 0) {
          step.isUploading = true;
        }
      });

      const uploadData = this.collectAllDocumentsForUpload();
      
      const response = await firstValueFrom(this.kycService.uploadKycDocuments(uploadData));

      this.kycSteps.forEach(step => {
        if (step.canSubmit && step.files.length > 0) {
          step.isUploading = false;
          step.uploadSuccess = true;
          step.completed = true;
          step.canSubmit = false;
          step.status = 'PENDING';
        }
      });

      this.userKycDocuments = response.data;
      this.calculateProgress();
      this.snackbar.open(`${response.data.length} documents envoyés !`, 'Fermer', { duration: 4000 });
      setTimeout(() => this.currentStep = 0, 2000);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      this.kycSteps.forEach(step => step.isUploading = false);
      this.snackbar.open(error.message || 'Erreur envoi documents', 'Fermer', { duration: 5000 });
    }
  }

  collectAllDocumentsForUpload(): KycDocumentUpload {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const allDocuments: any[] = [];
    const allFiles: File[] = [];

    this.kycSteps.forEach(step => {
      if (step.canSubmit && step.files.length > 0) {
        if (step.id === 'ID_PROOF') {
          if (!step.idDocumentNumber?.trim()) throw new Error('Numéro pièce d\'identité manquant');
          if (!step.expirationDate) throw new Error('Date d\'expiration manquante');
          if (step.files.length !== 2) throw new Error('Pièce d\'identité : 2 fichiers requis');
          
          const expDate = new Date(step.expirationDate);
          if (expDate <= new Date()) throw new Error('Date d\'expiration doit être future');
        }

        allDocuments.push({
          type: step.id,
          idDocumentNumber: step.idDocumentNumber?.trim() || '',
          ...(step.expirationDate && { expirationDate: step.expirationDate }),
          ...(step.taxIdNumber?.trim() && { taxIdNumber: step.taxIdNumber.trim() })
        });
        allFiles.push(...step.files);
      }
    });

    if (allDocuments.length === 0) throw new Error('Aucun document prêt');
    return { 
      documents: [
        {
          type: allDocuments[0].type,
          idDocumentNumber: allDocuments[0].idDocumentNumber,
          expirationDate: allDocuments[0].expirationDate,
          taxIdNumber: allDocuments[0].taxIdNumber,
        },
        ...allDocuments
      ], 
      files: allFiles 
    };
  }

  onFileSelected(event: Event, stepIndex: number): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const files = Array.from(input.files);
      const step = this.kycSteps[stepIndex];

      if (!step.canSubmit) return;

      if (step.id === 'ID_PROOF' && step.files.length + files.length > 2) {
        this.snackbar.open('Maximum 2 fichiers pour pièce d\'identité.', 'Fermer');
        return;
      }

      const validFiles = files.filter(file =>
        file.type.startsWith('image/') || file.type === 'application/pdf'
      );

      if (validFiles.length !== files.length) {
        this.snackbar.open('Seuls images et PDF acceptés.', 'Fermer');
        return;
      }

      const oversizedFiles = validFiles.filter(file => file.size > 10 * 1024 * 1024);
      if (oversizedFiles.length > 0) {
        this.snackbar.open('Fichiers > 10MB non acceptés.', 'Fermer');
        return;
      }

      step.files = [...step.files, ...validFiles];
      this.snackbar.open(`${validFiles.length} fichier(s) ajouté(s)`, 'Fermer');
    }
  }

  removeFile(stepIndex: number, fileIndex: number): void {
    if (!this.kycSteps[stepIndex].canSubmit) return;
    this.kycSteps[stepIndex].files.splice(fileIndex, 1);
    this.snackbar.open('Fichier supprimé', 'Fermer');
  }

  navigateToStep(stepIndex: number): void {
    this.currentStep = stepIndex;
  }

  nextStep(): void {
    if (this.currentStep < this.kycSteps.length - 1) this.currentStep++;
  }

  prevStep(): void {
    if (this.currentStep > 0) this.currentStep--;
  }

  onDrop(event: DragEvent, stepIndex: number): void {
    event.preventDefault();
    const step = this.kycSteps[stepIndex];
    if (!step.canSubmit) return;

    if (event.dataTransfer?.files) {
      const inputEvent = { target: { files: event.dataTransfer.files } } as unknown as Event;
      this.onFileSelected(inputEvent, stepIndex);
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
  }

  getFileIcon(file: File): string {
    if (file.type === 'application/pdf') return 'picture_as_pdf';
    if (file.type.startsWith('image/')) return 'image';
    return 'insert_drive_file';
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  getStatusIcon(status: string): string {
    switch (status) {
      case 'APPROVED': return 'check_circle';
      case 'REJECTED': return 'cancel';
      case 'PENDING': return 'schedule';
      default: return 'help';
    }
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'APPROVED': return '#4caf50';
      case 'REJECTED': return '#f44336';
      case 'PENDING': return '#ff9800';
      default: return '#9e9e9e';
    }
  }

  getStatusText(status: string): string {
    switch (status) {
      case 'APPROVED': return 'Approuvé';
      case 'REJECTED': return 'Rejeté';
      case 'PENDING': return 'En attente';
      default: return 'Inconnu';
    }
  }

  get maxExpirationDate(): string {
    const today = new Date();
    today.setFullYear(today.getFullYear() + 10);
    return today.toISOString().split('T')[0];
  }

  get currentStepData(): KycStep {
    return this.kycSteps[this.currentStep];
  }

  get showAddressProof(): boolean {
    return !this.isCanadian;
  }

  get completedStepsCount(): number {
    return this.kycSteps.filter(step => step.completed && step.canSubmit !== false).length;
  }

  get isUploadingInProgress(): boolean {
    return this.kycSteps.some(step => step.isUploading);
  }

  /*get readyDocumentsCount(): number {
    return this.kycSteps.filter(step => step.canSubmit && step.files.length > 0).length;
  }*/

  get areDocumentsReady(): boolean {
    const required = this.isCanadian ? 3 : 4;
    return this.readyDocumentsCount >= required;
  }

  get readyDocumentsCount(): number {
    let count = 0;
    
    this.kycSteps.forEach(step => {
      if (step.canSubmit && step.files.length > 0) {
        // ✅ ID_PROOF compte pour 2 documents (recto + verso)
        if (step.id === 'ID_PROOF' && step.files.length === 2) {
          count += 2;  // 2 documents pour ID_PROOF
        } else {
          count += 1;  // 1 document pour les autres étapes
        }
      }
    });
    
    return count;
  }
}
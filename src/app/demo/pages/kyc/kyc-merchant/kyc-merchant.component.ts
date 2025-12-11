import { Component, effect, OnInit, output, ViewChild, OnDestroy } from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { BulkReviewItem, KycService } from 'src/app/@theme/services/kyc.service';
import { KycDocument, MeResponse } from 'src/app/@theme/models';
import { SharedModule } from 'src/app/demo/shared/shared.module';
import { CommonModule } from '@angular/common';
import { ThemeLayoutService } from 'src/app/@theme/services/theme-layout.service';
import { ImageDialogComponent } from 'src/app/@theme/components/image-dialog/image-dialog.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-kyc-list',
    templateUrl: './kyc-merchant.component.html',
  styleUrl: './kyc-merchant.component.scss',
  imports: [SharedModule, CommonModule],
})
export class KycMerchantComponent implements OnInit, OnDestroy {
  displayedColumns: string[] = ['user', 'type', 'status', 'createdAt', 'action'];
  dataSource: MatTableDataSource<KycDocument> = new MatTableDataSource<KycDocument>([]);
  isLoading = false;
  totalItems = 0;
  currentPage = 1;
  itemsPerPage = 10;
  searchText = '';
  readonly HeaderBlur = output();
  direction: string = 'ltr';
  private intervalId!: ReturnType<typeof setInterval>;


  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(private kycService: KycService,private themeService: ThemeLayoutService,private dialog: MatDialog) {
    effect(() => {
      this.isRtlTheme(this.themeService.directionChange());
    });
  }

  private isRtlTheme(direction: string) {
    this.direction = direction;
  }
  ngOnInit(): void {
    this.loadDocuments();

     this.intervalId = setInterval(() => {
      this.loadDocuments();
    }, 30000);
  }

  ngOnDestroy(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  loadDocuments(): void {
    this.isLoading = true;
    this.kycService.getPendingDocuments(this.currentPage, this.itemsPerPage, "MERCHANT")
      .subscribe({
        next: (response) => {
          console.log('Documents:', response);
          if (response?.data?.items) {
            this.dataSource.data = response.data.items;
            this.totalItems = response.data.totalItems;
          }
          this.isLoading = false;
        },
        error: (err) => {
          this.isLoading = false;
          console.error('Error loading documents:', err);
        }
      });
  }

  applyFilter(filterValue: string): void {
    this.searchText = filterValue;
    this.currentPage = 1;
    this.loadDocuments();
  }

  onPageChange(event: PageEvent): void {
    this.currentPage = event.pageIndex + 1;
    this.itemsPerPage = event.pageSize;
    this.loadDocuments();
  }

  formatType(type: string): string {
    const types: { [key: string]: string } = {
      'ID_PROOF': 'Pièce d\'identité',
      'ADDRESS_PROOF': 'Justificatif de domicile',
      'SELFIE': 'Selfie'
    };
    return types[type] || type;
  }

  formatStatus(status: string): string {
    return status.charAt(0) + status.slice(1).toLowerCase();
  }

  downloadDocument(url: string): void {
    window.open(url, '_blank');
  }

 // Dans votre classe component
userKycDocuments: KycDocument[] = [];
userInfo: MeResponse ;
isLoadingDocuments = false;
// showRejectionForm = false;
// rejectionReason = '';
// selectedDocument : KycDocument | null = null;

// Méthode pour charger les documents d'un utilisateur
loadUserDocuments(userId: number): void {
  this.isLoadingDocuments = true;
  this.kycService.getUserKyc(userId).subscribe({
    next: (response) => {
      this.userKycDocuments = response.data.kyc;
      this.userInfo = response.data.user;
      this.isLoadingDocuments = false;
    },
    error: (err) => {
      console.error('Error loading user documents:', err);
      this.isLoadingDocuments = false;
    }
  });
}



// Ajoutez ces propriétés
showRejectionForm = false;
rejectionReason = '';
selectedDocument: KycDocument | null = null;
isBulkRejection = false;

// Méthode pour ouvrir le formulaire de rejet
openRejectionForm(document?: KycDocument): void {
  this.selectedDocument = document || null;
  this.isBulkRejection = !document;
  this.rejectionReason = '';
  this.showRejectionForm = true;
}

// Méthode pour confirmer le rejet
onRejectConfirm(): void {
  if (!this.rejectionReason) return;

  if (this.isBulkRejection) {
    this.rejectAllDocuments();
  } else if (this.selectedDocument) {
    this.rejectSingleDocument(this.selectedDocument.id, this.rejectionReason);
  }

  this.showRejectionForm = false;
  this.rejectionReason = '';
}

// Méthode pour rejeter tous les documents
rejectAllDocuments(): void {
  const docsToReject = this.userKycDocuments.map(doc => ({
    id: doc.id,
    status: 'REJECTED' as const,
    rejectionReason: this.rejectionReason
  }));

  this.kycService.bulkReview({ documents: docsToReject }).subscribe({
    next: () => {
      this.loadUserDocuments(this.userInfo.user.id);
      this.loadDocuments();
    },
    error: (err) => console.error('Error rejecting all documents:', err)
  });
}

// Méthode pour approuver un document spécifique
approveSingleDocument(documentId: number): void {
  this.kycService.reviewKyc(documentId,{ status: 'APPROVED' }).subscribe({
    next: () => {
      this.loadUserDocuments(this.userInfo.user.id);
      this.loadDocuments(); // Rafraîchir la liste principale
    },
    error: (err) => console.error('Error approving document:', err)
  });
}

// Méthode pour approuver tous les documents
approveAllDocuments(): void {

  const docsToApprove: BulkReviewItem[] = this.userKycDocuments.map(doc => ({
     id: doc.id,
     status: 'APPROVED'
   }));

   this.kycService.bulkReview({ documents: docsToApprove }).subscribe({
     next: () => {
       this.loadUserDocuments(this.userInfo.user.id);
       this.loadDocuments(); // Rafraîchir la liste principale
     },
     error: (err) => console.error('Error approving all documents:', err)
   });
 }

// Méthode pour rejeter un document spécifique
rejectSingleDocument(documentId: number, reason: string): void {
  this.kycService.reviewKyc(documentId, {
    status: 'REJECTED',
    rejectionReason: reason
  }).subscribe({
    next: () => {
      this.loadUserDocuments(this.userInfo.user.id);
      this.loadDocuments();
    },
    error: (err) => console.error('Error rejecting document:', err)
  });
}


  headerBlur1(userId: number): void {
    this.HeaderBlur.emit();
    this.loadUserDocuments(userId)
  }
  headerBlur() {
    this.HeaderBlur.emit();
  }

  openImageDialog(imageUrl: string): void {
  this.dialog.open(ImageDialogComponent, {
    data: { imageUrl },
    panelClass: 'image-dialog-container',
    maxWidth: '90vw',
    maxHeight: '90vh'
  });
}
}

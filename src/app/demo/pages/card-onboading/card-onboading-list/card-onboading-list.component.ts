import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { MatDrawer } from '@angular/material/sidenav';
import { CardService } from 'src/app/@theme/services/card.service';
import { ContactPoint, KycDocument, SessionParty, SessionPartyUserResponse, SessionType } from 'src/app/@theme/models/card';
// import { MatDialog } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { SharedModule } from 'src/app/demo/shared/shared.module';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BaseResponse } from 'src/app/@theme/models';

@Component({
  selector: 'app-card-onboarding-list',
  templateUrl: './card-onboading-list.component.html',
  styleUrls: ['./card-onboading-list.component.scss'],
  imports: [CommonModule, SharedModule],
})
export class CardOnboardingListComponent implements OnInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild('drawer') drawer!: MatDrawer;

  isLoading = false;
  searchText = '';
  currentStatus = ''; // Valeur par défaut
 statusOptions = [
  { value: '', label: 'Tous' },
  { value: 'WAITING_FOR_INFORMATION', label: 'En attente d\'info' },
  { value: 'UNDER_VERIFICATION', label: 'En vérification' },
  { value: 'INIT', label: 'Initial' },
  { value: 'VERIFIED', label: 'Vérifié' },
  { value: 'REFUSED', label: 'Refusé' },
  { value: 'REFUSED_TIMEOUT', label: 'Refusé (timeout)' }
];

  displayedColumns: string[] = ['user', 'type', 'status', 'createdAt', 'action'];
  dataSource = new MatTableDataSource<SessionParty>();
  totalItems = 0;
  itemsPerPage = 10;
  currentPage = 1;

  selectedParty: SessionType | null = null;
  selectedKycDocuments: BaseResponse<KycDocument> | null = null;
  headerBlur = false;

  constructor(
    private cardService: CardService,
    // private dialog: MatDialog
    private snackBar: MatSnackBar // Assurez-vous d'importer MatSnackBar
  ) { }

  ngOnInit(): void {
    this.loadOnboardingRequests();
  }

 loadOnboardingRequests(): void {
  this.isLoading = true;

  // Ne pas envoyer de paramètre status si currentStatus est vide
  const status = this.currentStatus === '' ? undefined : this.currentStatus;

  this.cardService.getOnboardingRequests(status).subscribe({
    next: (response: SessionPartyUserResponse) => {
      this.dataSource.data = response.data;
      this.totalItems = response.data.length;
      this.isLoading = false;

      console.log('Onboarding requests loaded:', response.data, 'Total items:', this.totalItems);
    },
    error: (err) => {
      console.error('Error loading onboarding requests', err);
      this.isLoading = false;
    }
  });
}


  applyFilter(filterValue: string): void {
    this.searchText = filterValue.trim().toLowerCase();
    this.dataSource.filter = this.searchText;
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  onStatusChange(status: string): void {
    this.currentStatus = status;
    this.loadOnboardingRequests();
  }

  onPageChange(event: PageEvent): void {
    this.currentPage = event.pageIndex + 1;
    this.itemsPerPage = event.pageSize;
    this.loadOnboardingRequests();
  }



  viewDetails(party: SessionType): void {
    this.selectedParty = party;
    this.headerBlur = true;
    this.drawer.toggle();

    this.cardService.getKycDocuments(party.user.id).subscribe({
      next: (docs) => this.selectedKycDocuments = docs,
      error: (err) => console.error('Erreur de chargement KYC:', err),
    });
  }


  approveOnboarding(partyKey: string): void {
    // Implémentez la logique d'approbation
    console.log('Approve onboarding for:', partyKey);
  }

  rejectOnboarding(partyKey: string): void {
    // Implémentez la logique de rejet
    console.log('Reject onboarding for:', partyKey);
  }

  openDocument(): void {
    // this.dialog.open(DocumentViewerComponent, {
    //   width: '80%',
    //   height: '90%',
    //   data: { document }
    // });
  }

 formatStatus(status: string): string {
  switch(status) {
    case 'WAITING_FOR_INFORMATION': return 'En attente d\'info';
    case 'UNDER_VERIFICATION': return 'En vérification';
    case 'INIT': return 'Initial';
    case 'VERIFIED': return 'Vérifié';
    case 'REFUSED': return 'Refusé';
    case 'REFUSED_TIMEOUT': return 'Refusé (timeout)';
    default: return status;
  }
}

  formatType(type: string): string {
    switch (type) {
      case 'IDENTITY': return 'Identité';
      case 'ADDRESS': return 'Adresse';
      case 'SELFIE': return 'Selfie';
      default: return type;
    }
  }

  getPrimaryEmail(contactPoints: ContactPoint[]): string {
    const email = contactPoints?.find(cp => cp.type === 'EMAIL');
    return email?.value || 'Aucun email';
  }

  downloadDocument(url: string): void {
    window.open(url, '_blank');
  }

  // Dans votre composant

getDocumentType(docType: string): 'ID_PROOF' | 'ADDRESS_PROOF' | 'NIU_PROOF' | 'SELFIE' {
  console.log('getDocumentType called with:', docType);
  switch(docType) {
    case 'NATIONALID': return 'ID_PROOF';
    case 'Locationmap': return 'ADDRESS_PROOF';
    case 'NIU': return 'NIU_PROOF';
    case 'SELFIE': return 'SELFIE';
    default: return 'ID_PROOF'; // Valeur par défaut
  }
}

sendDocumentToNeero(documentType: 'ID_PROOF' | 'ADDRESS_PROOF' | 'NIU_PROOF' | 'SELFIE', userId: number): void {
  this.cardService.sendDocumentToNeero(documentType, userId).subscribe({
    next: () => {
      this.snackBar.open(`Document ${documentType} envoyé avec succès`, 'Fermer', {
        duration: 3000
      });
    },
    error: (err) => {
      console.error('Erreur lors de l\'envoi du document', err);
      this.snackBar.open(`Erreur lors de l'envoi du document ${documentType}`, 'Fermer', {
        duration: 3000
      });
    }
  });
}

submitDocumentsToNeero(userId: number) {
  this.cardService.submitDocumentsToNeero(userId).subscribe({
    next: () => {
      this.snackBar.open('Tous les documents ont été soumis avec succès', 'Fermer', {
        duration: 3000
      });
    },
    error: (err) => {
      console.error('Erreur lors de la soumission des documents', err);
      this.snackBar.open('Erreur lors de la soumission des documents', 'Fermer', {
        duration: 3000
      });
    }
  });
}
}

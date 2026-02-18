import { Component, OnInit, ViewChild, OnDestroy, AfterViewInit } from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { MatDrawer } from '@angular/material/sidenav';
import { CardService } from 'src/app/@theme/services/card.service';
import { ContactPoint, KycDocument, SessionParty, SessionPartyFull, SessionPartyPagination, SessionType } from 'src/app/@theme/models/card';
import { CommonModule } from '@angular/common';
import { SharedModule } from 'src/app/demo/shared/shared.module';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BaseResponse } from 'src/app/@theme/models';
import { AuthenticationService } from 'src/app/@theme/services/authentication.service';

@Component({
  selector: 'app-card-onboarding-list',
  templateUrl: './card-onboading-list.component.html',
  styleUrls: ['./card-onboading-list.component.scss'],
  imports: [CommonModule, SharedModule],
})
export class CardOnboardingListComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild('drawer') drawer!: MatDrawer;

  isLoading = false;
  searchText = '';
  currentStatus = '';
  
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
  currentPage = 0;
  currentuserRole: string[] | undefined;
  sendocLoad = false;
  summitload = false;
  onboardingSession: SessionPartyFull['data'];

  selectedParty: SessionType | null = null;
  selectedKycDocuments: BaseResponse<KycDocument> | null = null;
  headerBlur = false;
  private intervalId!: ReturnType<typeof setInterval>;

  constructor(
    private cardService: CardService,
    private snackBar: MatSnackBar,
    private authentificationService: AuthenticationService
  ) { }

  ngOnInit(): void {
    this.currentuserRole = this.authentificationService.currentUserValue?.user.role;
    this.loadOnboardingRequests();
    this.intervalId = setInterval(() => {
      this.loadOnboardingRequests();
    }, 30000);
  }

  ngAfterViewInit(): void {
    // S'assurer que le paginator est bien initialisé
    this.dataSource.paginator = this.paginator;
  }

  ngOnDestroy(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  loadOnboardingRequests(): void {
    this.isLoading = true;

    const apiPage = this.currentPage;
    const status = this.currentStatus === '' ? undefined : this.currentStatus;

    console.log('Chargement des données:', {
      page: apiPage,
      pageSize: this.itemsPerPage,
      status: status,
      currentPage: this.currentPage
    });

    // CORRECTION : Utilisation du bon type d'observable
    this.cardService.getOnboardingRequests(apiPage, this.itemsPerPage, status).subscribe(
      (response: SessionPartyPagination) => {
        console.log('Réponse complète:', response);
        
        // CORRECTION : Structure de données plus robuste
        const items = response?.data?.items || [];
        const total = response?.data?.totalItems || 0;

        // Mise à jour synchrone des données
        this.dataSource.data = items;
        this.totalItems = total;

        console.log('Données chargées:', {
          itemsCount: items.length,
          totalItems: this.totalItems,
          currentPage: this.currentPage,
          itemsPerPage: this.itemsPerPage
        });

        this.isLoading = false;
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (error: any) => {
        console.error('Error loading onboarding requests', error);
        this.isLoading = false;
        this.snackBar.open('Erreur lors du chargement des données', 'Fermer', { duration: 3000 });
      }
    );
  }

  applyFilter(filterValue: string): void {
    this.searchText = filterValue.trim().toLowerCase();
    this.dataSource.filter = this.searchText;
    
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
    // Réinitialiser la pagination côté serveur
    this.currentPage = 0;
    this.loadOnboardingRequests();
  }

  onStatusChange(status: string): void {
    this.currentStatus = status;
    this.currentPage = 0;
    this.loadOnboardingRequests();
  }

  onPageChange(event: PageEvent): void {
    console.log('Changement de page:', event);
    
    // CORRECTION : Mise à jour avant le rechargement
    this.currentPage = event.pageIndex;
    this.itemsPerPage = event.pageSize;
    
    this.loadOnboardingRequests();
    
    // Scroll pour UX
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 100);
  }



    viewDetails(party: SessionType): void {
      this.selectedParty = party;
      this.headerBlur = true;
      this.drawer.toggle();

      //console.log('View details for:', party);

      this.cardService.getOnboardingSession(party.sessionParty.onboardingSessionKey).subscribe(
        (response) => {
          //console.log('onboarding session : ', response)
          this.onboardingSession = response.data
        },
        (err) => console.error("Erreur de recuperation de l'onboarding session : ", err)
      )

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



loadingMap = new Map<number, boolean>();

sendDocumentToNeero(documentType: 'ID_PROOF' | 'ADDRESS_PROOF' | 'NIU_PROOF' | 'SELFIE', userId: number, docId: number): void {
  this.loadingMap.set(docId, true);

  console.log('selectedParty : ', this.selectedParty);

  this.cardService.sendDocumentToNeero(documentType, userId).subscribe({
    next: () => {
      this.loadingMap.set(docId, false);


      this.snackBar.open(`Document ${documentType} envoyé avec succès`, 'Fermer', { duration: 3000 });
    },
    error: (err) => {
      this.loadingMap.set(docId, false);
      console.error('Erreur lors de l\'envoi du document', err);
      this.snackBar.open(`Erreur lors de l'envoi du document ${documentType}`, 'Fermer', { duration: 3000 });
    }
  });
}


submitDocumentsToNeero(userId: number) {
  this.summitload = true;
  this.cardService.submitDocumentsToNeero(userId).subscribe({
    next: () => {
      this.summitload = false;
      this.snackBar.open('Tous les documents ont été soumis avec succès', 'Fermer', {
        duration: 3000
      });
    },
    error: (err) => {
      this.summitload = false;
      console.error('Erreur lors de la soumission des documents', err);
      this.snackBar.open('Erreur lors de la soumission des documents', 'Fermer', {
        duration: 3000
      });
    }
  });
}
}

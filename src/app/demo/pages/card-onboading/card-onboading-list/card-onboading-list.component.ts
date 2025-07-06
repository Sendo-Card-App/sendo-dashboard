import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { MatDrawer } from '@angular/material/sidenav';
import { CardService } from 'src/app/@theme/services/card.service';
import { ContactPoint, SessionPartyUser, SessionPartyUserResponse } from 'src/app/@theme/models/card';
// import { MatDialog } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { SharedModule } from 'src/app/demo/shared/shared.module';

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
  dataSource = new MatTableDataSource<SessionPartyUser>();
  totalItems = 0;
  itemsPerPage = 10;
  currentPage = 1;

  selectedParty: SessionPartyUser | null = null;
  headerBlur = false;

  constructor(
    private cardService: CardService,
    // private dialog: MatDialog
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

  viewDetails(party: SessionPartyUser): void {
    this.selectedParty = party;
    this.headerBlur = true;
    this.drawer.toggle();
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
}

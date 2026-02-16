import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { CardService } from 'src/app/@theme/services/card.service';
import { VirtualCard, CardStatus, CardResponse } from 'src/app/@theme/models/card';
import { MatSort } from '@angular/material/sort';
import { SharedModule } from 'src/app/demo/shared/shared.module';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-card-list',
  templateUrl: './card-list.component.html',
  styleUrls: ['./card-list.component.scss'],
   imports: [SharedModule, CommonModule],
})
export class CardListComponent implements OnInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  isLoading = false;
  searchText = '';
  currentStatus: CardStatus | '' = '';

  // Options de filtre
  statusOptions: {value: CardStatus | '', label: string}[] = [
    { value: '', label: 'Tous les statuts' },
    { value: 'PRE_ACTIVE', label: 'Pré-activée' },
    { value: 'ACTIVE', label: 'Active' },
    { value: 'FROZEN', label: 'Bloquée' },
    { value: 'SUSPENDED', label: 'Suspendue' },
    { value: 'IN_TERMINATION', label: 'En cours de résiliation' },
    { value: 'TERMINATED', label: 'Résiliée' }
  ];

  // Configuration du tableau
  displayedColumns: string[] = ['cardName', 'last4Digits', 'expirationDate', 'status', 'createdAt', 'actions'];
  dataSource = new MatTableDataSource<VirtualCard>();

  // Pagination
  totalItems = 0;
  itemsPerPage = 10;
  currentPage = 1;

  constructor(private cardService: CardService, private router: Router) {}

  ngOnInit(): void {
    this.loadCards();
  }

  loadCards(): void {
    this.isLoading = true;

    this.cardService.getCards(
      this.currentPage,
      this.itemsPerPage,
      this.currentStatus === '' ? undefined : this.currentStatus,
      this.searchText ? this.searchText : undefined
    ).subscribe({
      next: (response: CardResponse) => {
        this.dataSource.data = response.data.items;
        this.totalItems = response.data.totalItems || response.data.total;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading cards', err);
        this.isLoading = false;
      }
    });
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.searchText = filterValue.trim().toLowerCase();
    this.dataSource.filter = this.searchText;
  }

  onStatusChange(status: CardStatus | ''): void {
    this.currentStatus = status;
    this.currentPage = 1; // Reset à la première page
    this.loadCards();
  }

  onPageChange(event: PageEvent): void {
    this.currentPage = event.pageIndex + 1;
    this.itemsPerPage = event.pageSize;
    this.loadCards();
  }

  formatStatus(status: CardStatus): string {
    const statusMap: Record<CardStatus, string> = {
      'PRE_ACTIVE': 'Pré-activée',
      'ACTIVE': 'Active',
      'FROZEN': 'Bloquée',
      'TERMINATED': 'Résiliée',
      'IN_TERMINATION': 'En résiliation',
      'SUSPENDED': 'Suspendue'
    };
    return statusMap[status] || status;
  }

  getStatusClass(status: CardStatus): string {
    return `status-${status.toLowerCase()}`;
  }

  viewDetails(cardId: number): void {
    this.router.navigate(['/card/', cardId, 'details']);
  }
}

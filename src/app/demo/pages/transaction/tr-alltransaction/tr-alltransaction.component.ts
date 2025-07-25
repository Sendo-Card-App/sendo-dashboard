import { Component, OnInit, ViewChild, AfterViewInit, TemplateRef, OnDestroy } from '@angular/core';
import { TransactionsService } from 'src/app/@theme/services/transactions.service';
import { Transactions, TransactionType, TransactionStatus } from 'src/app/@theme/models/index';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { FormBuilder, FormGroup } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { SharedModule } from 'src/app/demo/shared/shared.module';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { DatePipe } from '@angular/common';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-tr-all-transaction',
  templateUrl: './tr-alltransaction.component.html',
  imports: [CommonModule, SharedModule],
  styleUrls: ['./tr-alltransaction.component.scss'],
  providers: [DatePipe]
})
export class TrAllTransactionComponent implements OnInit, AfterViewInit, OnDestroy {
  displayedColumns: string[] = ['transactionId', 'username', 'amount', 'type', 'status', 'method', 'createdAt', 'actions'];
  dataSource = new MatTableDataSource<Transactions>([]);
  isLoading = false;
  totalItems = 0;
  currentPage = 0; // Changé à 0 pour correspondre à l'index Material
  itemsPerPage = 10;
  currentSort: { active: string; direction: 'asc' | 'desc' | '' } = { active: '', direction: '' };

  filterForm: FormGroup;
  maxDate = new Date();

  // Options for filters
  statusOptions = [
    { value: '', label: 'All' },
    { value: 'PENDING', label: 'Pending' },
    { value: 'COMPLETED', label: 'Completed' },
    { value: 'FAILED', label: 'Failed' }
  ];

  typeOptions = [
    { value: '', label: 'All' },
    { value: 'DEPOSIT', label: 'Deposit' },
    { value: 'WITHDRAWAL', label: 'Withdrawal' },
    { value: 'TRANSFER', label: 'Transfer' }
  ];

  methodOptions = [
    { value: '', label: 'All' },
    { value: 'MOBILE_MONEY', label: 'Mobile Money' },
    { value: 'BANK_TRANSFER', label: 'Bank Transfer' },
    { value: 'VIRTUAL_CARD', label: 'Virtual Card' }
  ];
   private intervalId!: ReturnType<typeof setInterval>;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private transactionsService: TransactionsService,
    private fb: FormBuilder,
    private router: Router,
    private datePipe: DatePipe,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
  ) {
    this.filterForm = this.fb.group({
      search: [''],
      status: [''],
      type: [''],
      method: [''],
      minAmount: [''],
      maxAmount: [''],
      startDate: [''],
      endDate: ['']
    });
  }

  ngOnInit(): void {
    this.loadTransactions();
    this.setupFilterListeners();

    // Auto-refresh every 30 seconds (30 000 ms)
    this.intervalId = setInterval(() => {
      this.loadTransactions();
    }, 30000);

    this.filterForm.get('search')?.valueChanges
    .pipe(debounceTime(200), distinctUntilChanged())
    .subscribe((value: string) => {
      this.applyFilter(value);
    });
  }

  ngOnDestroy(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  applyFilter(filterValue: string): void {
  this.dataSource.filter = filterValue.trim().toLowerCase();
}

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;

    this.sort.sortChange.subscribe(sort => {
      this.currentSort.active = sort.active;
      this.currentSort.direction = sort.direction || 'asc'; // Valeur par défaut si vide
      this.loadTransactions();
    });

    this.dataSource.filterPredicate = (data: Transactions, filter: string) => {
    const searchStr = [
      data.transactionId,
      data.user ? data.user.firstname : '',
      data.user ? data.user.lastname : '',
      data.amount?.toString(),
      data.type,
      data.status,
      data.method,
      data.description
    ].join(' ').toLowerCase();
    return searchStr.includes(filter);
  };

  this.sort.sortChange.subscribe(sort => {
    this.currentSort.active = sort.active;
    this.currentSort.direction = sort.direction || 'asc';
    this.loadTransactions();
  });
  }

  loadTransactions(): void {
    this.isLoading = true;
    // console.log('Transactions rechargées à', new Date().toLocaleTimeString());

    const formValues = this.filterForm.value;
    const startDate = formValues.startDate ? this.datePipe.transform(formValues.startDate, 'yyyy-MM-dd') : '';
    const endDate = formValues.endDate ? this.datePipe.transform(formValues.endDate, 'yyyy-MM-dd') : '';

    // Note: +1 car l'API attend probablement page=1 pour la première page
    const apiPage = this.currentPage + 1;

    this.transactionsService.getTransactions(
      apiPage,
      this.itemsPerPage,
      formValues.type as TransactionType,
      formValues.status as TransactionStatus,
      formValues.method as 'MOBILE_MONEY' | 'BANK_TRANSFER',
      startDate || undefined,
      endDate || undefined
    ).subscribe({
      next: (response) => {
        this.dataSource.data = response.data.items;
        this.totalItems = response.data.totalItems; // Assurez-vous que c'est le bon champ
        this.isLoading = false;

        // Synchronisez le paginator après le chargement
        if (this.paginator) {
          this.paginator.length = this.totalItems;
          this.paginator.pageIndex = this.currentPage;
        }
      },
      error: (error) => {
        console.error('Error loading transactions:', error);
        this.isLoading = false;
      }
    });
  }

  setupFilterListeners(): void {
    this.filterForm.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe(() => {
        this.currentPage = 0; // Réinitialise à la première page
        if (this.paginator) {
          this.paginator.firstPage();
        }
        this.loadTransactions();
      });
  }

  onPageChange(event: PageEvent): void {
    this.currentPage = event.pageIndex;
    this.itemsPerPage = event.pageSize;
    this.loadTransactions();

    // Optionnel: Faites défiler vers le haut pour une meilleure UX
    window.scrollTo(0, 0);
  }

  resetFilters(): void {
    this.filterForm.reset();
    this.currentPage = 0;
    if (this.paginator) {
      this.paginator.firstPage();
    }
    this.loadTransactions();
  }

  onDateChange(type: 'startDate' | 'endDate', event: MatDatepickerInputEvent<Date>): void {
    this.filterForm.get(type)?.setValue(event.value);
    this.currentPage = 0;
    this.loadTransactions();
  }

  formatType(type: string): string {
    return type ? type.toLowerCase().replace('_', ' ') : '';
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'COMPLETED': return 'status-completed';
      case 'PENDING': return 'status-pending';
      case 'FAILED': return 'status-failed';
      case 'BLOCKED': return 'status-failed';
      default: return '';
    }
  }

  viewDetails(transactionId: string): void {
    this.router.navigate(['/transactions', transactionId]);
  }

 // Ajoutez ces propriétés à votre classe
exportStartDate: Date | null = null;
exportEndDate: Date | null = null;
isExporting = false;

exportToCSV(): void {
  if (!this.exportStartDate || !this.exportEndDate) {
    this.snackBar.open('Veuillez sélectionner une plage de dates valide', 'Fermer', {
      duration: 3000,
      panelClass: ['error-snackbar']
    });
    return;
  }

  if (this.exportStartDate > this.exportEndDate) {
    this.snackBar.open('La date de début doit être antérieure à la date de fin', 'Fermer', {
      duration: 3000,
      panelClass: ['error-snackbar']
    });
    return;
  }

  this.isExporting = true;

  const startDate = this.datePipe.transform(this.exportStartDate, 'yyyy-MM-dd')!;
  const endDate = this.datePipe.transform(this.exportEndDate, 'yyyy-MM-dd')!;

  // D'abord obtenir le nombre total de transactions
  this.transactionsService.getTransactions(
    1,
    1, // On ne récupère qu'un seul élément pour connaître le total
    this.filterForm.value.type as TransactionType,
    this.filterForm.value.status as TransactionStatus,
    this.filterForm.value.method as 'MOBILE_MONEY' | 'BANK_TRANSFER',
    startDate,
    endDate
  ).subscribe({
    next: (initialResponse) => {
      const totalItems = initialResponse.data.totalItems;

      if (totalItems > 10000) {
        const confirmExport = confirm(`Vous êtes sur le point d'exporter ${totalItems} transactions. Cela peut prendre du temps. Souhaitez-vous continuer ?`);
        if (!confirmExport) {
          this.isExporting = false;
          return;
        }
      }

      // Maintenant récupérer toutes les données
      this.getAllTransactionsForExport(
        startDate,
        endDate,
        totalItems
      );
      this.exportDialogRef?.close();
    },
    error: (error) => {
      console.error('Error getting transaction count:', error);
      this.isExporting = false;
      this.snackBar.open('Erreur lors de la récupération des données', 'Fermer', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
    }
  });
}

private getAllTransactionsForExport(
  startDate: string,
  endDate: string,
  totalItems: number,
  currentPage: number = 1,
  accumulatedData: Transactions[] = []
): void {
  const pageSize = 500; // Nombre d'éléments par requête
  const totalPages = Math.ceil(totalItems / pageSize);

  this.transactionsService.getTransactions(
    currentPage,
    pageSize,
    this.filterForm.value.type as TransactionType,
    this.filterForm.value.status as TransactionStatus,
    this.filterForm.value.method as 'MOBILE_MONEY' | 'BANK_TRANSFER',
    startDate,
    endDate
  ).subscribe({
    next: (response) => {
      const newData = [...accumulatedData, ...response.data.items];

      if (currentPage >= totalPages) {
        // Toutes les données sont récupérées, générer le CSV
        this.generateCSV(newData, startDate, endDate);
        this.isExporting = false;
      } else {
        // Passer à la page suivante
        setTimeout(() => {
          this.getAllTransactionsForExport(
            startDate,
            endDate,
            totalItems,
            currentPage + 1,
            newData
          );
        }, 200); // Petit délai pour éviter de surcharger le serveur
      }
    },
    error: (error) => {
      console.error('Error during export:', error);
      this.isExporting = false;
      this.snackBar.open('Erreur lors de la récupération des données', 'Fermer', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
    }
  });
}

private generateCSV(transactions: Transactions[], startDate: string, endDate: string): void {
  // Entêtes CSV
  const headers = [
    'ID Transaction',
    'Utilisateur',
    'Montant',
    'Devise',
    'Type',
    'Statut',
    'Méthode',
    'Date',
    'Description'
  ];

  // Préparation des données
  const rows = transactions.map(t => [
    t.transactionId,
    t.user ? `${t.user.firstname} ${t.user.lastname}` : 'N/A',
    t.amount.toFixed(2),
    t.currency,
    t.type,
    t.status,
    t.method || 'N/A',
    this.datePipe.transform(t.createdAt, 'yyyy-MM-dd HH:mm:ss') || '',
    t.description || ''
  ]);

  // Création du contenu CSV
  const csvContent = [
    headers.join(','),
    ...rows.map(row =>
      row.map(field =>
        `"${field.toString().replace(/"/g, '""')}"`
      ).join(',')
    )
  ].join('\n');

  // Téléchargement du fichier
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `transactions_${startDate}_${endDate}_${new Date().getTime()}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

exportDialogRef?: MatDialogRef<void>;

openExportDialog(templateRef: TemplateRef<void>): void {
  this.exportDialogRef = this.dialog.open(templateRef, {
    // width: '600px',
    disableClose: true
  });
}


}

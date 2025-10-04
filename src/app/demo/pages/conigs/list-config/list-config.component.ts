import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { MatDrawer } from '@angular/material/sidenav';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { Config, BaseResponse } from 'src/app/@theme/models';
import { ConfigService, UpdateConfigRequest } from 'src/app/@theme/services/config.service';
import { SharedModule } from 'src/app/demo/shared/shared.module';
import { CommonModule } from '@angular/common';
import { AuthenticationService } from 'src/app/@theme/services/authentication.service';

@Component({
  selector: 'app-list-config',
  imports: [SharedModule, CommonModule],
  templateUrl: './list-config.component.html',
  styleUrl: './list-config.component.scss'
})
export class ListConfigComponent implements OnInit, OnDestroy {
   @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild('drawer') drawer!: MatDrawer;

  filterForm: FormGroup;
  isLoading = false;
  dataSource = new MatTableDataSource<Config>();
  displayedColumns: string[] = ['id', 'name', 'value', 'description', 'createdAt', 'actions'];
  totalItems = 0;
  itemsPerPage = 10;
  currentPage = 1;
  private destroy$ = new Subject<void>();
  currentuserRole: string | undefined;

  currentConfig: Config | null = null;
  configForm: FormGroup;
  isUpdatingConfig = false;

  constructor(
    private fb: FormBuilder,
    private configService: ConfigService,
    private snackBar: MatSnackBar,
    private authentificationService: AuthenticationService
  ) {
    this.filterForm = this.fb.group({
      search: ['']
    });

    this.configForm = this.fb.group({
      value: [''],
      description: ['']
    });
  }

  ngOnInit(): void {
     this.currentuserRole = this.authentificationService.currentUserValue?.user.role;
    this.setupFormListeners();
    this.loadConfigs();

  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private setupFormListeners(): void {
    this.filterForm.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        this.currentPage = 1;
        if (this.paginator) {
          this.paginator.firstPage();
        }
        this.loadConfigs();
      });
  }

  loadConfigs(): void {
  this.isLoading = true;
  this.dataSource.data = [];

  this.configService.getConfigs().subscribe({
    next: (response) => {
      this.dataSource.data = response.data as Config[];
      this.totalItems = (response.data as Config[]).length;
      this.isLoading = false;
    },
    error: (error) => {
      console.error('Error loading configs:', error);
      this.isLoading = false;
    }
  });
}

  openConfigDrawer(config: Config): void {
    this.currentConfig = config;
    this.configForm.patchValue({
      value: config.value,
      description: config.description
    });
    this.drawer.open();
  }

  closeDrawer(): void {
    this.drawer.close();
    this.currentConfig = null;
  }

 updateConfig(): void {
  if (!this.currentConfig || this.isUpdatingConfig) return;

  this.isUpdatingConfig = true;

  // Préparer le payload avec les valeurs du formulaire
  const payload: UpdateConfigRequest = {
    value: this.configForm.get('value')?.value,
    description: this.configForm.get('description')?.value
  };

  this.configService.updateConfig(this.currentConfig.id, payload)
    .subscribe({
      next: (response: BaseResponse & { data: Config }) => {
        this.snackBar.open('Configuration mise à jour avec succès', 'Fermer', {
          duration: 3000,
          panelClass: ['success-snackbar']
        });

        // Mettre à jour la configuration locale avec la réponse du serveur
        if (this.currentConfig) {
          Object.assign(this.currentConfig, response.data);
          this.updateConfigInList(this.currentConfig);
        }

        this.isUpdatingConfig = false;
        this.closeDrawer();
      },
      error: () => {
        this.snackBar.open('Échec de la mise à jour', 'Fermer', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
        this.isUpdatingConfig = false;
      }
    });
}

  private updateConfigInList(updatedConfig: Config): void {
    const index = this.dataSource.data.findIndex(c => c.id === updatedConfig.id);
    if (index !== -1) {
      this.dataSource.data[index] = updatedConfig;
      this.dataSource._updateChangeSubscription();
    }
  }

  onPageChange(event: PageEvent): void {
    this.currentPage = event.pageIndex + 1;
    this.itemsPerPage = event.pageSize;
    this.loadConfigs();
  }

  resetFilters(): void {
    this.filterForm.patchValue({
      search: ''
    }, { emitEvent: false });

    this.currentPage = 1;
    if (this.paginator) {
      this.paginator.firstPage();
    }
    this.loadConfigs();
  }
}

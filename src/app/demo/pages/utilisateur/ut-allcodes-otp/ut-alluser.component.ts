import { AfterViewInit, Component, ViewChild, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { finalize } from 'rxjs/operators';
import { CodeOTPResponse } from 'src/app/@theme/models';
import { UserService } from 'src/app/@theme/services/users.service';
import { SharedModule } from 'src/app/demo/shared/shared.module';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormGroup } from '@angular/forms';
import { AuthenticationService } from 'src/app/@theme/services/authentication.service';
import { MatTooltipModule } from '@angular/material/tooltip';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';

interface User {
  id: number;
  firstname: string;
  lastname: string;
  email: string;
  phone: string;
}
@Component({
  selector: 'app-ut-alluser',
  templateUrl: './ut-alluser.component.html',
  imports: [CommonModule, SharedModule, RouterModule, MatTooltipModule],
  styleUrls: ['./ut-alluser.component.scss']
})
export class UtAlluserComponent implements AfterViewInit, OnInit {
  displayedColumns = ['code', 'name', 'email', 'phone', 'createdAt', 'action'];
  dataSource = new MatTableDataSource<CodeOTPResponse>();
  isLoading = false;
  totalItems = 0;
  currentPage = 1;
  itemsPerPage = 10;
  searchText = '';
  filterForm: FormGroup;
  currentuserRole: string[] | undefined;

  // Subject pour la recherche avec debounce
  private searchSubject = new Subject<string>();

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private userService: UserService,
    private snackBar: MatSnackBar,
    private authentificationService: AuthenticationService
  ) {
  }
  ngAfterViewInit(): void {
    throw new Error('Method not implemented.');
  }

  private setupFilterListeners(): void {
    // Recherche avec debounce (300ms)
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged()
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    ).subscribe(searchText => {
      this.currentPage = 1; // Reset à la première page
      this.loadCodesOTP();
    });

    // Filtres avec reset de pagination
    this.filterForm.valueChanges.subscribe(() => {
      this.currentPage = 1;
      this.loadCodesOTP();
    });
  }

  ngOnInit(): void {
    this.currentuserRole = this.authentificationService.currentUserValue?.user.role;
    this.loadCodesOTP();
    this.setupFilterListeners();
  }

  loadCodesOTP() {
    this.isLoading = true;

    // Appeler le service avec tous les paramètres
    this.userService.getCodesOTP(
      this.currentPage,
      this.itemsPerPage,
      this.searchText || null
    )
      .pipe(finalize(() => this.isLoading = false))
      .subscribe(resp => {
        const filteredData = resp.data.items;

        this.dataSource.data = filteredData;
        this.totalItems = resp.data.totalItems;
        this.currentPage = resp.data.page;
      });
  }

  // Nouvelle méthode pour la recherche
  applyFilter(value: string) {
    this.searchText = value.trim().toLowerCase();
    this.searchSubject.next(this.searchText);
  }

  // Supprimer les anciennes méthodes de filtrage local
  // applyRoleFilter(): void { ... }
  // applyCountryFilter(): void { ... }

  resetFilters(): void {
    this.searchText = '';
    this.applyFilter('');
  }

  onPageChange(e: PageEvent) {
    this.itemsPerPage = e.pageSize;
    this.currentPage = e.pageIndex + 1;
    this.loadCodesOTP();
  }

  // Les autres méthodes restent inchangées...
  formatUserName(user: User): string {
    return `${user.firstname} ${user.lastname}`.trim();
  }

  getStableColor(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const h = hash % 360;
    return `hsl(${h}, 70%, 60%)`;
  }

  createStableAvatar(user: User): { letter: string; color: string } {
    const firstLetter = user.firstname ? user.firstname.charAt(0).toUpperCase() : '?';
    return {
      letter: firstLetter,
      color: this.getStableColor(user.firstname + user.lastname)
    };
  }

  verifyUserAccount(phone: string, code: string): void {
    this.userService.verifyUserAccount(phone, code).subscribe({
      next: () => {
        this.snackBar.open('Compte vérifié avec succès', 'Fermer', {
          duration: 3000,
          panelClass: ['success-snackbar']
        });
        this.loadCodesOTP();
      },
      error: (err) => {
        this.snackBar.open('Échec de vérification du compte', 'Fermer', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
        console.error('Verify error:', err);
      }
    });
  }
}

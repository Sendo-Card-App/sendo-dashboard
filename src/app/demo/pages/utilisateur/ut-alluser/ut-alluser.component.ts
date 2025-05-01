import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { SharedModule } from 'src/app/demo/shared/shared.module';
import { UserService } from 'src/app/@theme/services/users.service';
import { finalize } from 'rxjs/operators';
import { MeResponse } from 'src/app/@theme/models/index'; // Importez votre interface MeResponse

@Component({
  selector: 'app-ut-alluser',
  imports: [CommonModule, SharedModule, RouterModule],
  templateUrl: './ut-alluser.component.html',
  styleUrl: './ut-alluser.component.scss'
})
export class UtAlluserComponent implements AfterViewInit {
  // public props
  displayedColumns: string[] = ['name', 'email', 'role', 'phone', 'createdAt', 'action'];
  dataSource = new MatTableDataSource<MeResponse>();
  isLoading = false;
  searchText = '';
  totalItems = 0;
  currentPage = 1;
  itemsPerPage = 10;

  // paginator
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(private userService: UserService) {
    this.loadUsers();
  }

  loadUsers(page: number = this.currentPage, limit: number = this.itemsPerPage, search: string = this.searchText) {
    this.isLoading = true;
    this.userService.getUsers(page, limit, search)
      .pipe(finalize(() => this.isLoading = false))
      .subscribe({
        next: (response) => {
          this.dataSource.data = response.data.items;
          this.totalItems = response.data.totalItems;
          this.currentPage = response.data.page;
        },
        error: (err) => console.error('Error loading users:', err)
      });
  }

  // table search filter
  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.searchText = filterValue.trim().toLowerCase();
    this.loadUsers(1, this.itemsPerPage, this.searchText);
    if (this.paginator) {
      this.paginator.firstPage();
    }
  }

  // Handle page change
  onPageChange(event: PageEvent) {
    this.itemsPerPage = event.pageSize;
    this.currentPage = event.pageIndex + 1;
    this.loadUsers(this.currentPage, this.itemsPerPage, this.searchText);
  }

  // Format user name
  formatUserName(user: MeResponse): string {
    return `${user.firstname} ${user.lastname}`.trim();
  }

  // Format role name (adapt according to your role structure)
  formatRoleName(role: any): string {
    return role?.name || 'N/A';
  }

  // life cycle event
  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  getStableColor(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const h = hash % 360;
    return `hsl(${h}, 70%, 60%)`;
  }

  // Version alternative avec couleur stable
  createStableAvatar(user: MeResponse): { letter: string; color: string } {
    const firstLetter = user.firstname ? user.firstname.charAt(0).toUpperCase() : '?';
    return {
      letter: firstLetter,
      color: this.getStableColor(user.firstname + user.lastname)
    };
  }
}

import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { MatDrawer } from '@angular/material/sidenav';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { PubAdminService } from 'src/app/@theme/services/pub-admin.service';
import { Publicite } from 'src/app/@theme/models/index';
import { CommonModule } from '@angular/common';
import { SharedModule } from 'src/app/demo/shared/shared.module';
import { AuthenticationService } from 'src/app/@theme/services/authentication.service';

@Component({
  selector: 'app-pub-list',
  templateUrl: './pub-list.component.html',
  styleUrls: ['./pub-list.component.scss'],
  imports: [CommonModule, SharedModule],
})
export class PubListComponent implements OnInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild('drawer') drawer!: MatDrawer;

  dataSource = new MatTableDataSource<Publicite>();
  displayedColumns: string[] = ['id', 'name', 'imageUrl', 'isActive', 'createdAt', 'actions'];
  totalItems = 0;
  itemsPerPage = 10;
  currentPage = 1;
  isLoading = false;

  filterForm: FormGroup;
  currentPub: Publicite | null = null;
  isEditing = false;
  pubForm: FormGroup;
  currentuserRole: string[] | undefined;

  constructor(
    private pubService: PubAdminService,
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private authentificationService: AuthenticationService
  ) {
    this.filterForm = this.fb.group({
      search: ['']
    });

    this.pubForm = this.fb.group({
      name: [''],
      description: [''],
      imageUrl: [''],
      price: [0],
      link: [''],
      isActive: [false]
    });
  }

  ngOnInit(): void {
    this.currentuserRole = this.authentificationService.currentUserValue?.user.role;
    this.loadPublicites();
  }

  loadPublicites(): void {
    this.isLoading = true;
    this.pubService.getPublicites(this.currentPage, this.itemsPerPage)
      .subscribe({
        next: (response) => {

          this.dataSource.data = response.data.items;
          this.totalItems = response.data.totalItems;
          this.isLoading = false;
          console.log('Total items:', this.dataSource.data);
        },
        error: (error) => {
          console.error('Error loading publicites:', error.message);
          this.isLoading = false;
        }
      });
  }

  onPageChange(event: PageEvent): void {
    this.currentPage = event.pageIndex + 1;
    this.itemsPerPage = event.pageSize;
    this.loadPublicites();
  }

  openDetails(pub: Publicite): void {
    this.currentPub = pub;
    this.isEditing = false;
    this.pubForm.patchValue(pub);
    this.drawer.open();
  }

  closeDetails(): void {
    this.drawer.close();
    this.currentPub = null;
    this.isEditing = false;
  }

  toggleEdit(): void {
    this.isEditing = !this.isEditing;
    if (!this.isEditing) {
      this.pubForm.patchValue(this.currentPub!);
    }
  }

  updatePub(): void {
    if (!this.currentPub) return;

    this.isLoading = true;
    const updatedData = this.pubForm.value;

    this.pubService.updatePublicite(this.currentPub.id, updatedData)
      .subscribe({
        next: (response) => {
          this.snackBar.open('Publicité mise à jour avec succès', 'Fermer', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
          this.currentPub = response.data;
          this.updatePubInList(this.currentPub);
          this.isEditing = false;
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error updating pub:', error);
          this.snackBar.open('Erreur lors de la mise à jour', 'Fermer', {
            duration: 3000,
            panelClass: ['error-snackbar']
          });
          this.isLoading = false;
        }
      });
  }

  private updatePubInList(updatedPub: Publicite): void {
    const index = this.dataSource.data.findIndex(p => p.id === updatedPub.id);
    if (index !== -1) {
      this.dataSource.data[index] = updatedPub;
      this.dataSource._updateChangeSubscription();
    }
  }

  getStatusClass(isActive: boolean): string {
    return isActive ? 'status-active' : 'status-inactive';
  }
  deletePub(pub: Publicite): void {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette publicité ?')) return;

    this.isLoading = true;
    this.pubService.deletePublicite(pub.id)
      .subscribe({
        next: () => {
          this.snackBar.open('Publicité supprimée avec succès', 'Fermer', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
          this.dataSource.data = this.dataSource.data.filter(p => p.id !== pub.id);
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error deleting pub:', error);
          this.snackBar.open('Erreur lors de la suppression', 'Fermer', {
            duration: 3000,
            panelClass: ['error-snackbar']
          });
          this.isLoading = false;
        }
      });
  }
}

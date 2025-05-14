// image-dialog.component.ts
import { Component, Inject, HostListener } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-image-dialog',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, MatTooltipModule],
  template: `
    <div class="dialog-container">
      <div class="toolbar">
        <button mat-icon-button (click)="onClose()" matTooltip="Fermer" aria-label="Fermer la vue">
          <mat-icon>close</mat-icon>
        </button>

        <div class="spacer"></div>

        <button mat-icon-button (click)="zoomIn()" matTooltip="Zoom avant" aria-label="Zoom avant">
          <mat-icon>zoom_in</mat-icon>
        </button>

        <button mat-icon-button (click)="zoomOut()" matTooltip="Zoom arrière" aria-label="Zoom arrière">
          <mat-icon>zoom_out</mat-icon>
        </button>

        <button mat-icon-button (click)="resetZoom()" matTooltip="Réinitialiser zoom" aria-label="Réinitialiser zoom">
          <mat-icon>refresh</mat-icon>
        </button>

        <button mat-icon-button (click)="rotate()" matTooltip="Tourner 90°" aria-label="Tourner l'image">
          <mat-icon>rotate_90_degrees_cw</mat-icon>
        </button>
      </div>

      <div class="image-container" (wheel)="onWheel($event)">
        <img
          [src]="data.imageUrl"
          [style.transform]="'scale(' + zoomLevel + ') rotate(' + rotation + 'deg)'"
          [style.max-width]="zoomLevel === 1 ? '100%' : 'none'"
          [style.max-height]="zoomLevel === 1 ? '80vh' : 'none'"
          draggable="false"
          class="displayed-image"
          (click)="onImageClick($event)"
        >
      </div>

      <div class="footer">
        <span class="filename">{{ getFileName() }}</span>
        <span class="zoom-level">{{ (zoomLevel * 100).toFixed(0) }}%</span>
      </div>
    </div>
  `,
  styles: [`
    .dialog-container {
      display: flex;
      flex-direction: column;
      height: 100%;
      background-color: #424242;
      color: white;
    }

    .toolbar {
      display: flex;
      padding: 8px;
      background-color: #333;
      z-index: 2;
    }

    .spacer {
      flex: 1 1 auto;
    }

    .image-container {
      flex: 1;
      display: flex;
      justify-content: center;
      align-items: center;
      overflow: auto;
      padding: 20px;
    }

    .displayed-image {
      cursor: move;
      transition: transform 0.1s ease;
      user-select: none;
      object-fit: contain;
    }

    .footer {
      display: flex;
      justify-content: space-between;
      padding: 8px 16px;
      background-color: #333;
      font-size: 14px;
    }

    .filename {
      text-overflow: ellipsis;
      overflow: hidden;
      white-space: nowrap;
      max-width: 70%;
    }

    button.mat-icon-button {
      color: white;
      margin: 0 4px;
    }

    button.mat-icon-button:hover {
      background-color: rgba(255, 255, 255, 0.1);
    }
  `]
})
export class ImageDialogComponent {
  zoomLevel = 1;
  rotation = 0;
  private isDragging = false;
  private startX = 0;
  private startY = 0;
  private translateX = 0;
  private translateY = 0;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { imageUrl: string },
    private dialogRef: MatDialogRef<ImageDialogComponent>
  ) {}

  onClose(): void {
    this.dialogRef.close();
  }

  zoomIn(): void {
    this.zoomLevel = Math.min(this.zoomLevel + 0.25, 5);
  }

  zoomOut(): void {
    this.zoomLevel = Math.max(this.zoomLevel - 0.25, 0.25);
  }

  resetZoom(): void {
    this.zoomLevel = 1;
    this.translateX = 0;
    this.translateY = 0;
  }

  rotate(): void {
    this.rotation = (this.rotation + 90) % 360;
  }

  onWheel(event: WheelEvent): void {
    if (event.ctrlKey) {
      event.preventDefault();
      const delta = event.deltaY > 0 ? -0.1 : 0.1;
      this.zoomLevel = Math.max(0.25, Math.min(5, this.zoomLevel + delta));
    }
  }

  onImageClick(event: MouseEvent): void {
    if (this.zoomLevel === 1) {
      this.onClose();
    }
  }

  getFileName(): string {
    return this.data.imageUrl.split('/').pop() || 'document';
  }

  // Gestion du drag pour les images zoomées
  @HostListener('mousedown', ['$event'])
  onMouseDown(event: MouseEvent): void {
    if (this.zoomLevel > 1 && event.button === 0) {
      this.isDragging = true;
      this.startX = event.clientX - this.translateX;
      this.startY = event.clientY - this.translateY;
      event.preventDefault();
    }
  }

  @HostListener('document:mousemove', ['$event'])
  onMouseMove(event: MouseEvent): void {
    if (this.isDragging) {
      this.translateX = event.clientX - this.startX;
      this.translateY = event.clientY - this.startY;
      const img = document.querySelector('.displayed-image') as HTMLElement;
      if (img) {
        img.style.transform = `translate(${this.translateX}px, ${this.translateY}px) scale(${this.zoomLevel}) rotate(${this.rotation}deg)`;
      }
    }
  }

  @HostListener('document:mouseup')
  onMouseUp(): void {
    this.isDragging = false;
  }
}

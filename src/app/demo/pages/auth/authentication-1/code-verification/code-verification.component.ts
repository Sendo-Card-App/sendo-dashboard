// angular import
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';

// project import
import { SharedModule } from 'src/app/demo/shared/shared.module';
import { AuthenticationService } from 'src/app/@theme/services/authentication.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-code-verification',
  standalone: true,
  imports: [CommonModule, SharedModule, MatProgressSpinnerModule],
  templateUrl: './code-verification.component.html',
  styleUrls: ['./code-verification.component.scss', '../authentication-1.scss', '../../authentication.scss']
})
export class CodeVerificationComponent implements OnInit {
  loading = true;
  verificationStatus: 'pending' | 'success' | 'error' = 'pending';
  message = 'Vérification du compte en cours...';

  constructor(
    private authService: AuthenticationService,
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.verifyAccount();
  }

  verifyAccount(): void {
    const token = this.route.snapshot.queryParamMap.get('token');

    if (!token) {
      this.handleError('Token manquant dans l\'URL');
      return;
    }

    this.authService.verifyAccount(token).subscribe({
      next: (response) => {
        this.verificationStatus = 'success';
        this.message = response.message || 'Votre compte a été vérifié avec succès';
        this.showSnackbar(this.message, 'success');
        setTimeout(() => this.router.navigate(['/auth/login']), 3000);
      },
      error: (error) => {
        this.handleError(error.error?.message || 'Échec de la vérification du compte');
      },
      complete: () => {
        this.loading = false;
      }
    });
  }

  private handleError(errorMessage: string): void {
    this.verificationStatus = 'error';
    this.message = errorMessage;
    this.loading = false;
    this.showSnackbar(errorMessage, 'error');
    console.error('Erreur de vérification:', errorMessage);
  }

  private showSnackbar(message: string, type: 'success' | 'error'): void {
    this.snackBar.open(message, 'Fermer', {
      duration: 5000,
      panelClass: [`${type}-snackbar`]
    });
  }
}

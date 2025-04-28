// angular import
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { finalize } from 'rxjs/operators';

// project import
import { SharedModule } from 'src/app/demo/shared/shared.module';
import { AuthenticationService } from 'src/app/@theme/services/authentication.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { CardComponent } from 'src/app/@theme/components/card/card.component';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [
    CommonModule,
    SharedModule,
    FormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    CardComponent
  ],
  templateUrl: './reset-password.component.html',
  styleUrls: ['../authentication-1.scss', '../../authentication.scss', './reset-password.component.scss']
})
export class ResetPasswordComponent {
  // public props
  hide = true;
  coHide = true;
  loading = false;
  token: string = '';
  newPassword: string = '';
  confirmPassword: string = '';

  constructor(
    private authService: AuthenticationService,
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.route.queryParams.subscribe(params => {
      this.token = params['token'] || '';
      if (!this.token) {
        this.showError('Invalid password reset link');
        this.router.navigate(['/auth/forgot-password']);
      }
    });
  }

  onSubmit() {
    if (!this.newPassword || !this.confirmPassword) {
      this.showError('Please fill all fields');
      return;
    }

    if (this.newPassword !== this.confirmPassword) {
      this.showError('Passwords do not match');
      return;
    }

    this.loading = true;
    this.authService.resetPassword(this.newPassword, this.token)
      .pipe(
        finalize(() => this.loading = false)
      )
      .subscribe({
        next: () => {
          this.showSuccess('Password reset successfully');
          this.router.navigate(['/auth/login']);
        },
        error: (error) => {
          this.showError(error.error?.message || 'Password reset failed');
        }
      });
  }

  private showSuccess(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 5000,
      panelClass: ['success-snackbar']
    });
  }

  private showError(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 5000,
      panelClass: ['error-snackbar']
    });
  }
}

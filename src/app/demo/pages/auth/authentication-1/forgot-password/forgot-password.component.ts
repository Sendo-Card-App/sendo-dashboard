// angular import
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, Validators } from '@angular/forms';
import { RouterModule,Router } from '@angular/router';

// project import
import { SharedModule } from 'src/app/demo/shared/shared.module';
import { AuthenticationService } from 'src/app/@theme/services/authentication.service';

@Component({
  selector: 'app-forgot-password',
  imports: [CommonModule, SharedModule, RouterModule],
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss', '../authentication-1.scss', '../../authentication.scss']
})
export class ForgotPasswordComponent {


  constructor(
    private fb: FormBuilder,
    private router: Router
  ) {}


  forgotForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]]
  });

  isLoading = false;
  message: string | null = null;
  error: string | null = null;

  authenticationService = inject(AuthenticationService);

  onSubmit() {
    if (this.forgotForm.invalid) return;

    this.isLoading = true;
    this.error = null;
    this.message = null;

    const email = this.forgotForm.value.email!;

    this.authenticationService.forgotPassword(email).subscribe({
      next: (response) => {
        this.message = response.message || 'Un email de réinitialisation a été envoyé';
        this.forgotForm.reset();
        // this.router.navigate(['/auth/reset-password']);
      },
      error: (err) => {
        this.error = err.error?.message || 'Une erreur est survenue';
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }
  // public method
  // getErrorMessage() {
  //   if (this.email.hasError('required')) {
  //     return 'Email est requis';
  //   }

  //   return this.email.hasError('email') ? 'Email incorrect' : '';
  // }


}

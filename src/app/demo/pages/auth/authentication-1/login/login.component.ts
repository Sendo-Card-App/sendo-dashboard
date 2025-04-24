import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { SharedModule } from 'src/app/demo/shared/shared.module';
import { AuthenticationService } from 'src/app/@theme/services/authentication.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    HttpClientModule,
    SharedModule
  ],
  templateUrl: './login.component.html',
  styleUrls: [
    './login.component.scss',
    '../authentication-1.scss',
    '../../authentication.scss'
  ]
})
export class LoginComponent implements OnInit {
  public loginForm!: FormGroup;
  public submitted = false;
  public hide = true;
  public error: string | null = null;

  constructor(
    public authenticationService: AuthenticationService,
    private router: Router,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      email: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  onSubmit(): void {
    this.submitted = true;
    if (this.loginForm.invalid) {
      return;
    }
    const { email, password } = this.loginForm.value;
    this.error = null;
    this.authenticationService.login(email, password).subscribe({

      next: () => this.router.navigate(['/dashboard']),
      error: err => {
        console.error('Login failed:', err);
        this.error = err.error?.message || 'Échec de la connexion';
      }
    });
  }
}

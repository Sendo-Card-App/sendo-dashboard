import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { SharedModule } from 'src/app/demo/shared/shared.module';
import { AuthenticationService } from 'src/app/@theme/services/authentication.service';
import { BaseResponse } from 'src/app/@theme/models';
import { switchMap, tap, catchError } from 'rxjs/operators';
import { of } from 'rxjs';

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
    
    // Arrête la soumission si le formulaire est invalide
    if (this.loginForm.invalid) {
      return;
    }
  
    const data = this.loginForm.value;
    this.error = null;
  
    // Appel au service d'authentification
    this.authenticationService.login(data).pipe(
      // Opérateur switchMap pour chaîner les appels API
      switchMap((loginResponse: BaseResponse) => {
        console.log('Login response:', loginResponse);
        
        // Stocke les données de connexion
        localStorage.setItem('login-sendo', JSON.stringify(loginResponse.data));
        
        // Récupère les infos utilisateur après le login
        return this.authenticationService.getUserIdentifiant().pipe(
          tap((userResponse: BaseResponse) => {
            console.log('User info:', userResponse.data);
            localStorage.setItem('user-info', JSON.stringify(userResponse.data));
          }),
          catchError((error) => {
            console.error('User info error:', error);
            this.error = error.error?.message || error;
            // On retourre un Observable vide pour continuer malgré l'erreur
            return of(null);
          })
        );
      })
    ).subscribe({
      next: () => {
        // Redirige après succès (même si getUserIdentifiant a échoué)
        this.router.navigate(['/sample-page']);
      },
      error: (error) => {
        console.error('Login error:', error);
        this.error = error.error?.message || error;
      }
    });
  }
}

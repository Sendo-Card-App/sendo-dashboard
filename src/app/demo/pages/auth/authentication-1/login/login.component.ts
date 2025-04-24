import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { SharedModule } from 'src/app/demo/shared/shared.module';
import { AuthenticationService } from 'src/app/@theme/services/authentication.service';
import { BaseResponse } from 'src/app/@theme/models';

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
    const data = this.loginForm.value;
    this.error = null;
    try {
      this.authenticationService.login(data).subscribe((response: BaseResponse) => {
        console.log(response)
        localStorage.setItem('login-sendo', JSON.stringify(response.data))
        this.router.navigate(['/dashboard'])
      }, (error) => {
        console.log('error', error)
        this.error = error.error?.message || 'Échec de la connexion';
      });
    } catch (error) {
      console.log(error)
    }
  }
}

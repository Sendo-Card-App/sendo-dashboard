// src/app/auth/guards/already-logged-in.guard.ts
import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthenticationService } from '../services/authentication.service';

@Injectable({ providedIn: 'root' })
export class AlreadyLoggedInGuard implements CanActivate {
  constructor(
    private authService: AuthenticationService,
    private router: Router
  ) {}

  canActivate(): boolean {
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/dashboard']); // Redirige vers la page d'accueil
      return false; // Bloque l'accès à la route
    }
    return true; // Autorise l'accès
  }
}

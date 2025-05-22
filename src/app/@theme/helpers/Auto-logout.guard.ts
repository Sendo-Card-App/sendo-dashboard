import { Injectable, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { interval, Subscription } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { AuthenticationService } from '../services/authentication.service';

/**
 * Service d'auto-déconnexion :
 * - Déclenche automatiquement la déconnexion via AuthenticationService
 *   pour envoyer le deviceId et invalider la session côté backend
 * - Vide le localStorage et redirige vers la page de connexion
 * Exécuté toutes les 24 heures pour renforcer la sécurité.
 */
@Injectable({ providedIn: 'root' })
export class AutoLogoutService implements OnDestroy {
  /** Intervalle de 24h en millisecondes */
  private readonly LOGOUT_INTERVAL = 24 * 60 * 60 * 1000;
  private timerSub!: Subscription;

  constructor(
    private authService: AuthenticationService,
    private router: Router,
  ) {
    this.startAutoLogout();
  }

  private startAutoLogout(): void {
    // Dispatch un logout toutes les 24h
    this.timerSub = interval(this.LOGOUT_INTERVAL)
      .pipe(
        switchMap(() => this.authService.logout())
      )
      .subscribe({
        next: () => this.clearSessionAndRedirect(),
        error: err => console.error('AutoLogout error:', err)
      });
  }

  /** Vide le localStorage et redirige vers la page de login */
  private clearSessionAndRedirect(): void {
    // Utilisez clearSession de votre service si besoin
    this.authService.clearSession();
    // Ou manuellement:
    // localStorage.clear();
    this.router.events.subscribe(e => console.log(e));

    this.router.navigate(['/']);
  }

  ngOnDestroy(): void {
    if (this.timerSub) {
      this.timerSub.unsubscribe();
    }
  }
}

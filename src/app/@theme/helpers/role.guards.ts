import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router, CanActivateChild } from '@angular/router';
import { AuthenticationService } from '../services/authentication.service';
import { MeResponse } from '../models';

@Injectable({ providedIn: 'root' })
export class RoleGuard implements CanActivate, CanActivateChild {
  constructor(
    private auth: AuthenticationService,
    private router: Router
  ) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    return this.checkRoleAccess(route);
  }

  canActivateChild(childRoute: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    return this.checkRoleAccess(childRoute);
  }

  private checkRoleAccess(route: ActivatedRouteSnapshot): boolean {
    const user = this.auth.getStoredUser();

    // 1. Vérification de la connexion
    if (!user) {
      this.router.navigate(['/'], { queryParams: { returnUrl: route.url } });
      return false;
    }

    // 2. Vérification du rôle
    if (!user.role) {
      this.router.navigate(['/unauthorized']);
      return false;
    }

    // 3. Récupération des rôles autorisés
    const allowedRoles: string[] = route.data['roles'] || [];

    // 4. Si aucun rôle requis, accès autorisé
    if (allowedRoles.length === 0) {
      return true;
    }

    // 5. Vérification du rôle utilisateur
    if (allowedRoles.includes(user.role.name)) {
      return true;
    }

    // 6. Accès refusé
    this.router.navigate(['/unauthorized']);
    return false;
  }
}
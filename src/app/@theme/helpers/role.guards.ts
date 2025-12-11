import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router, CanActivateChild } from '@angular/router';
import { AuthenticationService } from '../services/authentication.service';
import { MeResponse } from '../models'; // Assurez-vous d'importer la bonne interface

@Injectable({ providedIn: 'root' })
export class RoleGuard implements CanActivate, CanActivateChild {
  constructor(
    private auth: AuthenticationService,
    private router: Router
  ) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    return this.checkRoleAccess(route);
  }

  canActivateChild(childRoute: ActivatedRouteSnapshot): boolean {
    return this.checkRoleAccess(childRoute);
  }

  private checkRoleAccess(route: ActivatedRouteSnapshot): boolean {
    const user = this.auth.getStoredUser() as MeResponse['user']; // Cast vers MeResponse

    // 1. Vérification de la connexion
    if (!user) {

      this.router.navigate(['/']);
      return false;
    }

    // 2. Vérification des rôles
    if (!user.roles || user.roles.length === 0) {
      this.router.navigate(['/unauthorized']);
      return false;
    }

    // 3. Récupération des rôles autorisés
    const allowedRoles: string[] = route.data['roles'] || [];

    // 4. Si aucun rôle requis, accès autorisé
    if (allowedRoles.length === 0) {
      return true;
    }

    // 5. Vérification des rôles utilisateur
    const hasRequiredRole = user.roles.some(role =>
      allowedRoles.includes(role.name)
    );

    if (hasRequiredRole) {
      return true;
    }

    // 6. Accès refusé
    this.router.navigate(['/unauthorized']);
    return false;
  }
}

// Angular import
import { Component, NgZone, OnInit, inject, input } from '@angular/core';
import { Location } from '@angular/common';

// project import
import { NavigationItem } from 'src/app/@theme/types/navigation';
import { SharedModule } from 'src/app/demo/shared/shared.module';
import { MenuCollapseCompactComponent } from '../menu-collapse/menu-collapse.component';
import { MenuItemCompactComponent } from '../menu-item/menu-item.component';
import { AuthenticationService } from 'src/app/@theme/services/authentication.service';

@Component({
  selector: 'app-menu-group-compact',
  imports: [SharedModule, MenuCollapseCompactComponent, MenuItemCompactComponent],
  templateUrl: './menu-group.component.html',
  styleUrls: ['./menu-group.component.scss']
})
export class MenuGroupCompactComponent implements OnInit {
  private zone = inject(NgZone);
  private location = inject(Location);
  private authenticationService = inject(AuthenticationService);

  // public props
  readonly item = input.required<NavigationItem>();
  current_url!: string;

  // Life cycle events
  ngOnInit() {
    this.current_url = this.location.path();
    //eslint-disable-next-line
    //@ts-ignore
    const baseHref = this.location['_baseHref'] || '';
    this.current_url = baseHref + this.current_url;

    setTimeout(() => {
      const links = document.querySelectorAll('a.nav-link') as NodeListOf<HTMLAnchorElement>;
      links.forEach((link: HTMLAnchorElement) => {
        if (link.getAttribute('href') === this.current_url) {
          let parent = link.parentElement;
          while (parent && parent.classList) {
            if (parent.classList.contains('coded-hasmenu')) {
              parent.classList.add('coded-trigger');
              parent.classList.add('active');
            }
            parent = parent.parentElement;
          }
        }
      });
    }, 0);
  }

  // Nouvelle méthode pour filtrer les enfants selon les permissions
  getFilteredChildren(): NavigationItem[] {
    const currentUserRole = this.authenticationService.currentUserValue?.user?.role;
    const parentRoles = this.item().role || [];

    if (!this.item().children) return [];

    return this.item().children!.filter(child => {
      // Si l'enfant est caché, on le filtre
      if (child.hidden) return false;

      // Si pas de rôle utilisateur, filtrer
      if (!currentUserRole) return false;

      // Si l'enfant a des rôles spécifiques
      if (child.role && child.role.length > 0) {
        return this.hasRoleAccess(child.role, currentUserRole);
      }

      // Si l'enfant n'a pas de rôle, on vérifie le rôle du parent
      if (parentRoles.length > 0) {
        return this.hasRoleAccess(parentRoles, currentUserRole);
      }

      // Si ni l'enfant ni le parent n'ont de rôle, on affiche
      return true;
    });
  }

  private hasRoleAccess(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    requiredRoles: any[],
    userRole: string | string[],
  ): boolean {
    // Convertir les rôles en noms de string
    const roleNames = requiredRoles.map(role =>
      typeof role === 'string' ? role : role.name
    );

    // Vérifier si le rôle utilisateur est dans les rôles requis
    if (Array.isArray(userRole)) {
      return userRole.some(role => roleNames.includes(role));
    }
    return roleNames.includes(userRole);
  }
}

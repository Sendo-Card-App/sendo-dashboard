// Angular import
import { Component, OnInit, inject, input } from '@angular/core';
import { RouterModule } from '@angular/router';
import { animate, style, transition, trigger } from '@angular/animations';
import { CommonModule, Location } from '@angular/common';

// project import
import { NavigationItem } from 'src/app/@theme/types/navigation';
import { SharedModule } from 'src/app/demo/shared/shared.module';
import { MenuItemCompactComponent } from '../menu-item/menu-item.component';
import { AuthenticationService } from 'src/app/@theme/services/authentication.service';

@Component({
  selector: 'app-menu-collapse-compact',
  imports: [SharedModule, CommonModule, RouterModule, MenuItemCompactComponent],
  templateUrl: './menu-collapse.component.html',
  styleUrls: ['./menu-collapse.component.scss'],
  animations: [
    trigger('slideInOut', [
      transition(':enter', [
        style({ transform: 'translateY(-100%)', display: 'block' }),
        animate('250ms ease-in', style({ transform: 'translateY(0%)' }))
      ]),
      transition(':leave', [animate('250ms ease-in', style({ transform: 'translateY(-100%)' }))])
    ])
  ]
})
export class MenuCollapseCompactComponent implements OnInit {
  private location = inject(Location);
  private authenticationService = inject(AuthenticationService);

  // public props
  current_url: string = '';
  isEnabled: boolean = false;

  readonly item = input<NavigationItem>();
  readonly parentRole = input<string[]>();

  visible = false;
  windowWidth = window.innerWidth;

  // public method
  ngOnInit() {
    this.current_url = this.location.path();
    //eslint-disable-next-line
    //@ts-ignore
    const baseHref = this.location['_baseHref'] || '';
    this.current_url = baseHref + this.current_url;

    // Timeout to allow DOM to fully render before checking for the links
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

    this.checkPermission();
  }

  private checkPermission(): void {
    const currentUserRole = this.authenticationService.currentUserValue?.user?.role;
    const item = this.item();
    const parentRoles = this.parentRole() || [];

    // Si pas de rôle utilisateur ou pas d'item, désactiver
    if (!currentUserRole || !item) {
      this.isEnabled = false;
      return;
    }

    // Si l'item a des rôles spécifiques
    if (item.role && item.role.length > 0) {
      this.isEnabled = this.hasRoleAccess(item.role, currentUserRole);
    }
    // Si l'item n'a pas de rôles mais le parent en a
    else if (parentRoles.length > 0) {
      this.isEnabled = this.hasRoleAccess(parentRoles, currentUserRole);
    }
    // Si aucun rôle n'est défini, autoriser par défaut
    else {
      this.isEnabled = true;
    }

    // console.log('MenuCollapseCompact Permission check:', {
    //   item: item.title,
    //   currentUserRole,
    //   itemRoles: item.role,
    //   parentRoles,
    //   isEnabled: this.isEnabled
    // });
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

  // Method to handle the collapse of the navigation menu
  navCollapse(e: MouseEvent) {
    if (!this.isEnabled) {
      e.preventDefault();
      return;
    }

    let parent = e.target as HTMLElement;

    if (parent?.tagName === 'SPAN') {
      parent = parent.parentElement!;
    }

    parent = (parent as HTMLElement).parentElement!;

    const sections = document.querySelectorAll('.coded-hasmenu');
    for (let i = 0; i < sections.length; i++) {
      if (sections[i] !== parent) {
        sections[i].classList.remove('coded-trigger');
      }
    }

    let first_parent = parent.parentElement!;
    let pre_parent = ((parent as HTMLElement).parentElement as HTMLElement).parentElement!;
    if (first_parent.classList.contains('coded-hasmenu')) {
      do {
        first_parent.classList.add('coded-trigger');
        first_parent = (first_parent.parentElement as HTMLElement).parentElement!;
      } while (first_parent.classList.contains('coded-hasmenu'));
    } else if (pre_parent.classList.contains('coded-submenu')) {
      do {
        pre_parent.parentElement?.classList.add('coded-trigger');
        pre_parent = (((pre_parent as HTMLElement).parentElement as HTMLElement).parentElement as HTMLElement).parentElement!;
      } while (pre_parent.classList.contains('coded-submenu'));
    }
    parent.classList.toggle('coded-trigger');
  }

  // Nouvelle méthode pour filtrer les enfants selon les permissions
  getFilteredChildren(): NavigationItem[] {
    const currentUserRole = this.authenticationService.currentUserValue?.user?.role;
    const item = this.item();
    const parentRoles = this.parentRole() || [];

    if (!item?.children) return [];

    return item.children.filter(child => {
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
}

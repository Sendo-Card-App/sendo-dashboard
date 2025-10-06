// Angular import
import { Component, OnInit, inject, input } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

// Project import
import { NavigationItem } from 'src/app/@theme/types/navigation';
import { ThemeLayoutService } from 'src/app/@theme/services/theme-layout.service';
import { SharedModule } from 'src/app/demo/shared/shared.module';
import { AuthenticationService } from 'src/app/@theme/services/authentication.service';

@Component({
  selector: 'app-menu-item',
  imports: [RouterModule, SharedModule, CommonModule],
  templateUrl: './menu-item.component.html',
  styleUrls: ['./menu-item.component.scss']
})
export class MenuItemVerticalComponent implements OnInit {
  private themeService = inject(ThemeLayoutService);
  private authenticationService = inject(AuthenticationService);

  // public props
  readonly item = input.required<NavigationItem>();
  readonly parentRole = input<string[]>();

  isEnabled: boolean = false;

  //life cycle hook
  ngOnInit() {
    this.checkPermission();
  }

  private checkPermission(): void {
    const currentUserRole = this.authenticationService.currentUserValue?.user?.role;
    const item = this.item();
    const parentRoles = this.parentRole() || [];

    // Si pas de rôle utilisateur, désactiver
    if (!currentUserRole) {
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

    console.log('Permission check:', {
      item: item.title,
      currentUserRole,
      itemRoles: item.role,
      parentRoles,
      isEnabled: this.isEnabled
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

  // public method
  toggleMenu(event: MouseEvent) {
    if (window.innerWidth < 1025) {
      this.themeService.toggleSideDrawer();
    }

    const ele = event.target as HTMLElement;
    if (ele !== null && ele !== undefined) {
      const parent = ele.parentElement as HTMLElement;
      const up_parent = ((parent.parentElement as HTMLElement).parentElement as HTMLElement).parentElement as HTMLElement;
      const last_parent = (up_parent.parentElement as HTMLElement).parentElement as HTMLElement;

      if (last_parent.classList.contains('coded-submenu')) {
        up_parent.classList.remove('coded-trigger');
        up_parent.classList.remove('active');
      } else {
        const sections = document.querySelectorAll('.coded-hasmenu');
        for (let i = 0; i < sections.length; i++) {
          sections[i].classList.remove('active');
          sections[i].classList.remove('coded-trigger');
        }
      }

      if (parent.classList.contains('coded-hasmenu')) {
        parent.classList.add('coded-trigger');
        parent.classList.add('active');
      } else if (up_parent.classList.contains('coded-hasmenu')) {
        up_parent.classList.add('coded-trigger');
        up_parent.classList.add('active');
      } else if (last_parent.classList.contains('coded-hasmenu')) {
        last_parent.classList.add('coded-trigger');
        last_parent.classList.add('active');
      }
    }
  }
}

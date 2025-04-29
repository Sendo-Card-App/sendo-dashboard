// Angular Imports
import { Component, OnInit, inject } from '@angular/core';
import { Router, RouterLinkActive, RouterLink, RouterOutlet } from '@angular/router';

// Project import
import { CardComponent } from 'src/app/@theme/components/card/card.component';

// Angular Material
import { MatTabNav, MatTabLink, MatTabNavPanel } from '@angular/material/tabs';

@Component({
  selector: 'app-account-profile',
  templateUrl: './account-profile.component.html',
  styleUrl: './account-profile.component.scss',
  imports: [CardComponent, MatTabNav, MatTabLink, RouterLinkActive, RouterLink, MatTabNavPanel, RouterOutlet]
})
export class AccountProfileComponent implements OnInit {
  private router = inject(Router);

  // public props
  //eslint-disable-next-line
  navLinks: any[];
  activeLinkIndex = -1;

  // constructor
  constructor() {
    this.navLinks = [
      {
        label: 'Profil',
        link: '/application/profile/account/profile',
        icon: 'ti ti-user',
        index: 0
      },
      {
        label: 'Utilisateurs',
        link: '/application/profile/account/utilisateur',
        icon: 'ti ti-users',
        index: 1
      },
      {
        label: 'Mot de passe',
        link: '/application/profile/account/password',
        icon: 'ti ti-lock',
        index: 2
      },
      {
        label: 'Roles',
        link: '/application/profile/account/role',
        icon: 'ti ti-file-text',
        index: 3
      },
      // {
      //   label: 'My Account',
      //   link: '/application/profile/account/account',
      //   icon: 'ti ti-id',
      //   index: 4
      // },


      // {
      //   label: 'Settings',
      //   link: '/application/profile/account/settings',
      //   icon: 'ti ti-settings',
      //   index: 5
      // }
    ];
  }

  // life cycle
  ngOnInit(): void {
    this.router.events.subscribe(() => {
      this.activeLinkIndex = this.navLinks.indexOf(this.navLinks.find((tab) => tab.link === '.' + this.router.url));
    });
  }
}

// angular import
import { CommonModule } from '@angular/common';
import { Component, effect, inject, output } from '@angular/core';
import { Router, RouterModule } from '@angular/router';

// third party
import { TranslateService } from '@ngx-translate/core';

// project import
import { AuthenticationService } from 'src/app/@theme/services/authentication.service';
import { BuyNowLinkService } from 'src/app/@theme/services/buy-now-link.service';
import { ThemeLayoutService } from 'src/app/@theme/services/theme-layout.service';
import { AbleProConfig } from 'src/app/app-config';
import { SharedModule } from 'src/app/demo/shared/shared.module';

@Component({
  selector: 'app-nav-right',
  imports: [SharedModule, CommonModule, RouterModule],
  templateUrl: './toolbar-right.component.html',
  styleUrls: ['./toolbar-right.component.scss']
})
export class NavRightComponent {
  private translate = inject(TranslateService);
  authenticationService = inject(AuthenticationService);
  private themeService = inject(ThemeLayoutService);
  buyNowLinkService = inject(BuyNowLinkService);

  // public props
  readonly HeaderBlur = output();
  direction: string = 'ltr';

  // constructor
  constructor(private router: Router) {
    const translate = this.translate;

    translate.setDefaultLang(AbleProConfig.i18n);
    effect(() => {
      this.isRtlTheme(this.themeService.directionChange());
    });
  }

  // private methods
  private isRtlTheme(direction: string) {
    this.direction = direction;
  }

  // public method
  // user according language change of sidebar menu item
  useLanguage(language: string) {
    this.translate.use(language);
  }

  headerBlur() {
    this.HeaderBlur.emit();
  }

  // user Logout
  logout() {
    this.authenticationService.logout().subscribe({
        complete: () => {
            this.router.navigate(['/']);
        },
        error: (err) => {
            console.error('Logout error:', err);
            this.router.navigate(['/']);
        }
    });
}

  cards = [
    {
      icon: 'custom-layer',
      time: '2 min ago',
      position: 'UI/UX Design',
      description:
        "Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley oftype and scrambled it to make a type"
    },
    {
      icon: 'custom-sms',
      time: '1 hour ago',
      position: 'Message',
      description: "Lorem Ipsum has been the industry's standard dummy text ever since the 1500."
    }
  ];

  cards2 = [
    {
      icon: 'custom-document-text',
      time: '12 hour ago',
      position: 'Forms',
      description:
        "Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley oftype and scrambled it to make a type"
    },
    {
      icon: 'custom-security-safe',
      time: '18 hour ago',
      position: 'Security',
      description: "Lorem Ipsum has been the industry's standard dummy text ever since the 1500."
    }
  ];

  notification = [
    {
      sub_title: 'Improvement',
      time: '12 hour ago',
      title: 'Widgets update',
      img: 'assets/images/layout/img-announcement-3.png'
    },
    {
      sub_title: 'New Feature',
      time: '18 hour ago',
      title: 'Coming soon dark mode',
      img: 'assets/images/layout/img-announcement-4.png'
    }
  ];
}

import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminComponent } from './demo/layout/admin';
import { EmptyComponent } from './demo/layout/empty/empty.component';
import { GuestComponent } from './demo/layout/front/guest.component';
// import { AuthGuardChild } from './@theme/helpers/auth.guard';
import { RoleGuard } from './@theme/helpers/role.guards';
import { AlreadyLoggedInGuard } from './@theme/helpers/already-logged-in.guard';

const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'auth/login'
  },
  {
    path: 'auth',
    component: EmptyComponent,
    children: [
      {
        path: 'login',
        loadComponent: () => import('./demo/pages/auth/authentication-1/login/login.component').then((c) => c.LoginComponent),
        canActivate: [AlreadyLoggedInGuard]
      },
      {
        path: 'forgot-password',
        loadComponent: () => import('./demo/pages/auth/authentication-1/forgot-password/forgot-password.component').then((c) => c.ForgotPasswordComponent),
        canActivate: [AlreadyLoggedInGuard]
      },
      {
        path: 'reset-password',
        loadComponent: () => import('./demo/pages/auth/authentication-1/code-verification/code-verification.component').then((c) => c.CodeVerificationComponent),
        canActivate: [AlreadyLoggedInGuard]
      },
      {
        path: '',
        loadChildren: () => import('./demo/pages/auth/authentication-1/authentication-1.module').then((e) => e.Authentication1Module)
      }
    ]
  },
  {
    path: '',
    component: GuestComponent,
    children: [
      {
        path: 'contact-us',
        loadComponent: () => import('./demo/pages/contact-us/contact-us.component').then((c) => c.ContactUsComponent)
      },
      {
        path: 'components',
        loadChildren: () => import('src/app/demo/layout/component/component.module').then((m) => m.ComponentModule)
      },
      {
        path: 'maintenance',
        loadChildren: () => import('./demo/pages/maintenance/maintenance.module').then((m) => m.MaintenanceModule)
      }
    ]
  },
  {
    path: '',
    component: AdminComponent,
    canActivateChild: [RoleGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./demo/pages/other/sample-page/sample-page.component').then((c) => c.SamplePageComponent),
        data: { roles: ['SUPER_ADMIN'] }
      },
      {
        path: 'application',
        loadChildren: () => import('./demo/pages/application/application.module').then((m) => m.ApplicationModule),
        data: { roles: ['SUPER_ADMIN'] }
      },
    ]
  },
  {
    path: '**',
    loadComponent: () => import('./demo/pages/maintenance/error/error.component').then((c) => c.ErrorComponent)
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}

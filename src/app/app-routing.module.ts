import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminComponent } from './demo/layout/admin';
import { EmptyComponent } from './demo/layout/empty/empty.component';
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
        loadComponent: () => import('./demo/pages/auth/authentication-1/reset-password/reset-password.component').then((c) => c.ResetPasswordComponent),
        canActivate: [AlreadyLoggedInGuard]
      },
      {
        path: 'verify',
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
    path: 'users',
    component: AdminComponent,
    canActivateChild: [RoleGuard],
    children: [
      {
        path: 'alluser',
        loadComponent: () => import('./demo/pages/utilisateur/ut-alluser/ut-alluser.component').then((c) => c.UtAlluserComponent),
        data: { roles: ['SUPER_ADMIN'] }
      },
      {
        path: 'adduser',
        loadComponent: () => import('./demo/pages/utilisateur/ut-adduser/ut-adduser.component').then((c) => c.UtAdduserComponent),
        data: { roles: ['SUPER_ADMIN'] }
      },
      {
        path: 'edit/:id',
        loadComponent: () => import('./demo/pages/utilisateur/ut-updateuser/ut-updateuser.component').then((c) => c.UtUpdateuserComponent),
        data: { roles: ['SUPER_ADMIN'] }
      },
      {
        path: 'info/:id',
        loadComponent: () => import('./demo/pages/utilisateur/ut-infouser/ut-infouser.component').then((c) => c.UtInfouserComponent),
        data: { roles: ['SUPER_ADMIN'] }
      },

      // {
      //   path: 'components',
      //   loadChildren: () => import('src/app/demo/layout/component/component.module').then((m) => m.ComponentModule)
      // },
      // {
      //   path: 'maintenance',
      //   loadChildren: () => import('./demo/pages/maintenance/maintenance.module').then((m) => m.MaintenanceModule)
      // }
    ]
  },
  {
    path: 'transactions',
    component: AdminComponent,
    canActivateChild: [RoleGuard],
    children: [
      {
        path: 'alltransactions',
        loadComponent: () => import('./demo/pages/transaction/tr-alltransaction/tr-alltransaction.component').then((c) => c.TrAllTransactionComponent),
        data: { roles: ['SUPER_ADMIN'] }
      },
      {
        path: 'addtransaction',
        loadComponent: () => import('./demo/pages/transaction/tr-addtransaction/tr-addtransaction.component').then((c) => c.TrAddtransactionComponent),
        data: { roles: ['SUPER_ADMIN'] }
      },
      {
        path: ':transactionId',
        loadComponent: () => import('./demo/pages/transaction/transaction-detail/transaction-detail.component').then((c) => c.TransactionDetailComponent),
        data: { roles: ['SUPER_ADMIN'] }
      },

      // {
      //   path: 'components',
      //   loadChildren: () => import('src/app/demo/layout/component/component.module').then((m) => m.ComponentModule)
      // },
      // {
      //   path: 'maintenance',
      //   loadChildren: () => import('./demo/pages/maintenance/maintenance.module').then((m) => m.MaintenanceModule)
      // }
    ]
  },
  {
    path: '',
    component: AdminComponent,
    canActivateChild: [RoleGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./demo/pages/other/online-dashboard/online-dashboard.component').then((c) => c.OnlineDashboardComponent),
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

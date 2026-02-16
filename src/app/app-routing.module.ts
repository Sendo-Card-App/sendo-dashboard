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
        data: { roles: ['SUPER_ADMIN', 'SYSTEM_ADMIN', 'TECHNICAL_DIRECTOR', 'COMPLIANCE_OFFICER', 'MANAGEMENT_CONTROLLER', 'CUSTOMER_ADVISER', 'CARD_MANAGER'] }
      },
      {
        path: 'allmerchant',
        loadComponent: () => import('./demo/pages/utilisateur/ut-merchant/ut-merchant.component').then((c) => c.UtMerchantComponent),
        data: { roles: ['SUPER_ADMIN', 'SYSTEM_ADMIN', 'TECHNICAL_DIRECTOR', 'COMPLIANCE_OFFICER', 'MANAGEMENT_CONTROLLER', 'CUSTOMER_ADVISER', 'CARD_MANAGER'] }
      },
      {
        path: 'adduser',
        loadComponent: () => import('./demo/pages/utilisateur/ut-adduser/ut-adduser.component').then((c) => c.UtAdduserComponent),
        data: { roles: ['SUPER_ADMIN', 'SYSTEM_ADMIN'] }
      },
      {
        path: 'edit/:id',
        loadComponent: () => import('./demo/pages/utilisateur/ut-updateuser/ut-updateuser.component').then((c) => c.UtUpdateuserComponent),
        data: { roles: ['SUPER_ADMIN', 'SYSTEM_ADMIN'] }
      },
      {
        path: 'info/:id',
        loadComponent: () => import('./demo/pages/utilisateur/ut-infouser/ut-infouser.component').then((c) => c.UtInfouserComponent),
        data: { roles: ['SUPER_ADMIN', 'SYSTEM_ADMIN', 'TECHNICAL_DIRECTOR', 'COMPLIANCE_OFFICER', 'MANAGEMENT_CONTROLLER', 'CUSTOMER_ADVISER', 'CARD_MANAGER'] }
      },
      {
        path: 'merchant/:id',
        loadComponent: () => import('./demo/pages/utilisateur/ut-infomerchant/ut-infomerchant.component').then((c) => c.UtInfomerchantComponent),
        data: { roles: ['SUPER_ADMIN', 'SYSTEM_ADMIN', 'TECHNICAL_DIRECTOR', 'COMPLIANCE_OFFICER', 'MANAGEMENT_CONTROLLER', 'CUSTOMER_ADVISER', 'CARD_MANAGER'] }
      },

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
        data: { roles: ['SUPER_ADMIN', 'SYSTEM_ADMIN', 'TECHNICAL_DIRECTOR', 'COMPLIANCE_OFFICER', 'MANAGEMENT_CONTROLLER', 'CUSTOMER_ADVISER', 'CARD_MANAGER'] }
      },
      {
        path: 'ca-cam',
        loadComponent: () => import('./demo/pages/transaction/transaction-ca-cam/transaction-ca-cam.component').then((c) => c.TransactionCaCamComponent),
        data: { roles: ['SUPER_ADMIN', 'SYSTEM_ADMIN', 'TECHNICAL_DIRECTOR', 'COMPLIANCE_OFFICER', 'MANAGEMENT_CONTROLLER', 'CUSTOMER_ADVISER', 'CARD_MANAGER'] }
      },
      {
        path: 'addtransaction',
        loadComponent: () => import('./demo/pages/transaction/tr-addtransaction/tr-addtransaction.component').then((c) => c.TrAddtransactionComponent),
        data: { roles: ['SUPER_ADMIN'] }
      },
      {
        path: ':transactionId',
        loadComponent: () => import('./demo/pages/transaction/transaction-detail/transaction-detail.component').then((c) => c.TransactionDetailComponent),
        data: { roles: ['SUPER_ADMIN', 'SYSTEM_ADMIN', 'TECHNICAL_DIRECTOR', 'COMPLIANCE_OFFICER', 'MANAGEMENT_CONTROLLER', 'CUSTOMER_ADVISER', 'CARD_MANAGER'] }
      },
      {
        path: 'user/:userId',
        loadComponent: () => import('./demo/pages/transaction/transaction-list/transaction-list.component').then((c) => c.TransactionListComponent),
        data: { roles: ['SUPER_ADMIN', 'SYSTEM_ADMIN', 'TECHNICAL_DIRECTOR', 'COMPLIANCE_OFFICER', 'MANAGEMENT_CONTROLLER', 'CUSTOMER_ADVISER', 'CARD_MANAGER'] }
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
    path: 'kyc',
    component: AdminComponent,
    canActivateChild: [RoleGuard],
    children: [
      {
        path: 'kyc-pending',
        loadComponent: () => import('./demo/pages/kyc/kyc-list/kyc-list.component').then((c) => c.KycListComponent),
        data: { roles: ['SUPER_ADMIN', 'COMPLIANCE_OFFICER', 'CUSTOMER_ADVISER'] }
      },
       {
        path: 'kyc-merchant',
        loadComponent: () => import('./demo/pages/kyc/kyc-merchant/kyc-merchant.component').then((c) => c.KycMerchantComponent),
        data: { roles: ['SUPER_ADMIN', 'COMPLIANCE_OFFICER', 'CUSTOMER_ADVISER'] }
      },
      {
        path: 'kyc-all',
        loadComponent: () => import('./demo/pages/kyc/kyc-all/kyc-all.component').then((c) => c.KycAllComponent),
        data: { roles: ['SUPER_ADMIN', 'SYSTEM_ADMIN', 'TECHNICAL_DIRECTOR', 'MANAGEMENT_CONTROLLER', 'CARD_MANAGER'] }
      },


    ]
  },
  {
    path: 'requests',
    component: AdminComponent,
    canActivateChild: [RoleGuard],
    children: [
      {
        path: 'allrequests',
        loadComponent: () => import('./demo/pages/niu-request/all-request-niu/all-request-niu.component').then((c) => c.AllRequestNiuComponent),
        data: { roles: ['SUPER_ADMIN', 'SYSTEM_ADMIN', 'TECHNICAL_DIRECTOR', 'COMPLIANCE_OFFICER', 'MANAGEMENT_CONTROLLER', 'CUSTOMER_ADVISER', 'CARD_MANAGER'] }
      },

    ]
  },
  {
    path: 'withdrawals',
    component: AdminComponent,
    canActivateChild: [RoleGuard],
    children: [
      {
        path: 'merchant',
        loadComponent: () => import('./demo/pages/withdrawal/withdrawal-request-merchant/withdrawal-request.component').then((c) => c.WithdrawalRequestComponent),
        data: { roles: ['SUPER_ADMIN', 'SYSTEM_ADMIN', 'TECHNICAL_DIRECTOR', 'COMPLIANCE_OFFICER', 'MANAGEMENT_CONTROLLER', 'CUSTOMER_ADVISER', 'CARD_MANAGER'] }
      },
      {
        path: 'investment',
        loadComponent: () => import('./demo/pages/withdrawal/withdrawal-request-investment/withdrawal-request.component').then((c) => c.WithdrawalRequestComponent),
        data: { roles: ['SUPER_ADMIN', 'SYSTEM_ADMIN', 'TECHNICAL_DIRECTOR', 'COMPLIANCE_OFFICER', 'MANAGEMENT_CONTROLLER', 'CUSTOMER_ADVISER', 'CARD_MANAGER'] }
      },
    ]
  },
  {
    path: 'publicites',
    component: AdminComponent,
    canActivateChild: [RoleGuard],
    children: [
      {
        path: 'all',
        loadComponent: () => import('./demo/pages/pub/pub-list/pub-list.component').then((c) => c.PubListComponent),
        data: { roles: ['SUPER_ADMIN', 'SYSTEM_ADMIN', 'TECHNICAL_DIRECTOR'] }
      },
      {
        path: 'create',
        loadComponent: () => import('./demo/pages/pub/pub-add/pub-add.component').then((c) => c.PubAddComponent),
        data: { roles: ['SUPER_ADMIN'] }
      },

    ]
  },
  {
    path: 'shared-expenses',
    component: AdminComponent,
    canActivateChild: [RoleGuard],
    children: [
      {
        path: 'all',
        loadComponent: () => import('./demo/pages/shared-expense/shared-expense-list/shared-expense-list.component').then((c) => c.SharedExpenseListComponent),
        data: { roles: ['SUPER_ADMIN', 'SYSTEM_ADMIN', 'TECHNICAL_DIRECTOR', 'COMPLIANCE_OFFICER', 'MANAGEMENT_CONTROLLER', 'CUSTOMER_ADVISER', 'CARD_MANAGER'] }
      },
      {
        path: ':id',
        loadComponent: () => import('./demo/pages/shared-expense/shared-expense-detail/shared-expense-detail.component').then((c) => c.SharedExpenseDetailComponent),
        data: { roles: ['SUPER_ADMIN', 'SYSTEM_ADMIN', 'TECHNICAL_DIRECTOR', 'COMPLIANCE_OFFICER', 'MANAGEMENT_CONTROLLER', 'CUSTOMER_ADVISER', 'CUSTOMER_ADVISER', 'CARD_MANAGER'] }
      },
    ]
  },
  {
    path: 'requests',
    component: AdminComponent,
    canActivateChild: [RoleGuard],
    children: [
      {
        path: 'allrequests',
        loadComponent: () => import('./demo/pages/niu-request/all-request-niu/all-request-niu.component').then((c) => c.AllRequestNiuComponent),
        data: { roles: ['SUPER_ADMIN', 'SYSTEM_ADMIN', 'TECHNICAL_DIRECTOR', 'COMPLIANCE_OFFICER', 'MANAGEMENT_CONTROLLER', 'CUSTOMER_ADVISER', 'CARD_MANAGER'] }
      },

    ]
  },
  {
    path: 'tontines',
    component: AdminComponent,
    canActivateChild: [RoleGuard],
    children: [
      {
        path: 'all',
        loadComponent: () => import('./demo/pages/tontines/tontine-list/tontine-list.component').then((c) => c.TontineListComponent),
        data: { roles: ['SUPER_ADMIN', 'SYSTEM_ADMIN', 'TECHNICAL_DIRECTOR', 'COMPLIANCE_OFFICER', 'MANAGEMENT_CONTROLLER', 'CUSTOMER_ADVISER', 'CARD_MANAGER'] }
      },
      {
        path: ':id',
        loadComponent: () => import('./demo/pages/tontines/tontine-details/tontine-details.component').then((c) => c.TontineDetailsComponent),
        data: { roles: ['SUPER_ADMIN', 'SYSTEM_ADMIN', 'TECHNICAL_DIRECTOR', 'COMPLIANCE_OFFICER', 'MANAGEMENT_CONTROLLER', 'CUSTOMER_ADVISER', 'CARD_MANAGER'] }
      },
      {
        path: ':id/members',
        loadComponent: () => import('./demo/pages/tontines/tontine-listmember/tontine-listmember.component').then((c) => c.TontineListmemberComponent),
        data: { roles: ['SUPER_ADMIN', 'SYSTEM_ADMIN', 'TECHNICAL_DIRECTOR', 'COMPLIANCE_OFFICER', 'MANAGEMENT_CONTROLLER', 'CUSTOMER_ADVISER', 'CARD_MANAGER'] }
      },
    ]
  },
  {
    path: 'onboarding',
    component: AdminComponent,
    canActivateChild: [RoleGuard],
    children: [
      {
        path: 'card',
        loadComponent: () => import('./demo/pages/card-onboading/card-onboading-list/card-onboading-list.component').then((c) => c.CardOnboardingListComponent),
        data: { roles: ['SUPER_ADMIN', 'TECHNICAL_DIRECTOR', 'COMPLIANCE_OFFICER', 'MANAGEMENT_CONTROLLER', 'CUSTOMER_ADVISER', 'CARD_MANAGER'] }
      },

    ]
  },
  {
    path: 'commission',
    component: AdminComponent,
    canActivateChild: [RoleGuard],
    children: [
      {
        path: 'all',
        loadComponent: () => import('./demo/pages/commision/commission-list/commission-list.component').then((c) => c.CommissionListComponent),
        data: { roles: ['SUPER_ADMIN', 'SYSTEM_ADMIN'] }
      },

    ]
  },
  {
    path: 'card',
    component: AdminComponent,
    canActivateChild: [RoleGuard],
    children: [
      {
        path: 'all',
        loadComponent: () => import('./demo/pages/card/card-list/card-list.component').then((c) => c.CardListComponent),
        data: { roles: ['SUPER_ADMIN', 'SYSTEM_ADMIN', 'TECHNICAL_DIRECTOR', 'COMPLIANCE_OFFICER', 'MANAGEMENT_CONTROLLER', 'CARD_MANAGER'] }
      },
      {
        path: ':id/details',
        loadComponent: () => import('./demo/pages/card/card-detail/card-detail.component').then((c) => c.CardDetailComponent),
        data: { roles: ['SUPER_ADMIN', 'SYSTEM_ADMIN', 'TECHNICAL_DIRECTOR', 'COMPLIANCE_OFFICER', 'MANAGEMENT_CONTROLLER', 'CARD_MANAGER'] }
      },
      {
        path: ':id/list',
        loadComponent: () => import('./demo/pages/card/card-detail-list/card-detail-list.component').then((c) => c.CardDetailListComponent),
        data: { roles: ['SUPER_ADMIN', 'SYSTEM_ADMIN', 'TECHNICAL_DIRECTOR', 'COMPLIANCE_OFFICER', 'MANAGEMENT_CONTROLLER', 'CARD_MANAGER'] }
      },
    ]
  },
  {
    path: 'fund-requests',
    component: AdminComponent,
    canActivateChild: [RoleGuard],
    children: [
      {
        path: 'all',
        loadComponent: () => import('./demo/pages/fund-request/fund-request-list/fund-request-list.component').then((c) => c.FundRequestListComponent),
        data: { roles: ['SUPER_ADMIN', 'SYSTEM_ADMIN', 'TECHNICAL_DIRECTOR', 'CUSTOMER_ADVISER', 'CARD_MANAGER'] }
      },
      {
        path: ':id',
        loadComponent: () => import('./demo/pages/fund-request/fund-request-detail/fund-request-detail.component').then((c) => c.FundRequestDetailComponent),
        data: { roles: ['SUPER_ADMIN', 'SYSTEM_ADMIN', 'TECHNICAL_DIRECTOR', 'CUSTOMER_ADVISER', 'CARD_MANAGER'] }
      },
    ]
  },
  {
    path: 'configuration',
    component: AdminComponent,
    canActivateChild: [RoleGuard],
    children: [
      {
        path: 'allconfiguration',
        loadComponent: () => import('./demo/pages/conigs/list-config/list-config.component').then((c) => c.ListConfigComponent),
        data: { roles: ['SUPER_ADMIN', 'TECHNICAL_DIRECTOR', 'MANAGEMENT_CONTROLLER'] }
      },

    ]
  },
  {
    path: '',
    component: AdminComponent,
    canActivateChild: [RoleGuard],
    children: [
      {
        path: 'commission-palier',
        loadComponent: () => import('./demo/pages/commission-palier/commission-palier/commission-palier.component').then((c) => c.CommissionPalierComponent),
        data: { roles: ['SUPER_ADMIN','SYSTEM_ADMIN','TECHNICAL_DIRECTOR','COMPLIANCE_OFFICER','MANAGEMENT_CONTROLLER','CUSTOMER_ADVISER','CARD_MANAGER'] }
      },

    ]
  },
   {
    path: 'debts',
    component: AdminComponent,
    canActivateChild: [RoleGuard],
    children: [
      {
        path: 'all',
        loadComponent: () => import('./demo/pages/debts/debts-all/debts-all.component').then((c) => c.DebtsAllComponent),
        data: { roles: ['SUPER_ADMIN','SYSTEM_ADMIN','TECHNICAL_DIRECTOR','COMPLIANCE_OFFICER','MANAGEMENT_CONTROLLER'] }
      },

       {
        path: ':id',
        loadComponent: () => import('./demo/pages/debts/debts-info/debts-info.component').then((c) => c.DebtsInfoComponent),
        data: { roles: ['SUPER_ADMIN','SYSTEM_ADMIN','TECHNICAL_DIRECTOR','COMPLIANCE_OFFICER','MANAGEMENT_CONTROLLER'] }
      },

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
        data: { roles: ['SUPER_ADMIN', 'SYSTEM_ADMIN', 'TECHNICAL_DIRECTOR', 'COMPLIANCE_OFFICER', 'MANAGEMENT_CONTROLLER', 'CUSTOMER_ADVISER', 'CARD_MANAGER'] }
      },
      {
        path: 'chat',
        loadComponent: () => import('./demo/pages/chat/chat.component').then((c) => c.ChatComponent),
        data: { roles: ['SUPER_ADMIN', 'CUSTOMER_ADVISER'] }
      },
      {
        path: '',
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
  imports: [
    RouterModule.forRoot(routes)
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }

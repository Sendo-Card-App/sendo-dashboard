// angular import
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

// project import
import { AccountProfileComponent } from './account-profile.component';

// type
import { RoleGuard } from 'src/app/@theme/helpers/role.guards';

const routes: Routes = [
  {
    path: '',
    component: AccountProfileComponent,
    canActivateChild: [RoleGuard],
    children: [
      {
        path: '',
        redirectTo: '/application/profile/account/profile',
        pathMatch: 'full'
      },
      {
        path: 'profile',
        loadComponent: () => import('./ac-profile/ac-profile.component').then((c) => c.AcProfileComponent),
        data: { roles: ['SUPER_ADMIN'] }
      },
      {
        path: 'personal',
        loadComponent: () => import('./ac-personal/ac-personal.component').then((c) => c.AcPersonalComponent),
        data: { roles: ['SUPER_ADMIN'] }
      },
      {
        path: 'account',
        loadComponent: () => import('./ac-account/ac-account.component').then((c) => c.AcAccountComponent),
        data: { roles: ['SUPER_ADMIN'] }
      },
      {
        path: 'password',
        loadComponent: () => import('./ac-password/ac-password.component').then((c) => c.AcPasswordComponent),
        data: { roles: ['SUPER_ADMIN'] }
      },
      {
        path: 'role',
        loadComponent: () => import('./ac-role/ac-role.component').then((c) => c.AcRoleComponent),
        data: { roles: ['SUPER_ADMIN'] }
      },
      {
        path: 'settings',
        loadComponent: () => import('./ac-setting/ac-setting.component').then((c) => c.AcSettingComponent),
        data: { roles: ['SUPER_ADMIN'] }
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AccountProfileRoutingModule {}

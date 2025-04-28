// angular import
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RoleGuard } from 'src/app/@theme/helpers/role.guards';

//type

const routes: Routes = [
  {
    path: '',
    canActivateChild: [RoleGuard],
    children: [
      {
        path: 'account',
        loadChildren: () => import('./account-profile/account-profile.module').then((c) => c.AccountProfileModule),
        data: { roles: ['SUPER_ADMIN'] }
      },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ProfileRoutingModule {}

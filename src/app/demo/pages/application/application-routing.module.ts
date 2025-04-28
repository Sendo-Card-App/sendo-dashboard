// angular import
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RoleGuard } from 'src/app/@theme/helpers/role.guards';

//type
import { Role } from 'src/app/@theme/types/role';

const routes: Routes = [
  {
    path: '',
    canActivateChild: [RoleGuard],
    children: [
      {
        path: 'chat',
        loadComponent: () => import('./chat/chat.component').then((c) => c.ChatComponent),
        data: { roles: [Role.Admin, Role.User] }
      },
      {
        path: 'kanban',
        loadComponent: () => import('./kanban/kanban.component').then((c) => c.KanbanComponent),
        data: { roles: [Role.Admin, Role.User] }
      },
      {
        path: 'customer',
        loadComponent: () => import('./customer-list/customer-list.component').then((c) => c.CustomerListComponent),
        data: { roles: [Role.Admin, Role.User] }
      },
      {
        path: 'profile',
        loadChildren: () => import('./profile/profile.module').then((m) => m.ProfileModule),
        data: { roles: ['SUPER_ADMIN'] }
      },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ApplicationRoutingModule {}

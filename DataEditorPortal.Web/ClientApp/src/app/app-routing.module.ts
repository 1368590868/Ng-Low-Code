import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {
  AboutComponent,
  ContactComponent,
  ErrorPageComponent,
  LoginComponent,
  TileComponent,
  SiteSettingsComponent,
  DataDictionaryComponent,
  SystemLogComponent
} from './features/core';
import { AdminPermissionGuard, AuthRouterGuard } from './shared';

const routes: Routes = [
  { path: '', component: TileComponent },
  {
    path: 'about',
    component: AboutComponent
  },
  {
    path: 'contact',
    component: ContactComponent
  },
  { path: 'login', component: LoginComponent },
  {
    path: 'site-settings',
    component: SiteSettingsComponent,
    canActivate: [AuthRouterGuard, AdminPermissionGuard]
  },
  {
    path: 'data-dictionaries',
    component: DataDictionaryComponent,
    canActivate: [AuthRouterGuard, AdminPermissionGuard]
  },
  {
    path: 'system-event-logs',
    component: SystemLogComponent,
    canActivate: [AuthRouterGuard, AdminPermissionGuard]
  },
  {
    path: 'portal-item',
    loadChildren: () =>
      import('./features/universal-grid/universal-grid.module').then(
        m => m.UniversalGridModule
      ),
    canActivate: [AuthRouterGuard]
  },
  {
    path: 'portal-management',
    loadChildren: () =>
      import('./features/portal-management/portal-management.module').then(
        m => m.PortalManagementModule
      ),
    canActivate: [AuthRouterGuard, AdminPermissionGuard]
  },
  { path: '**', component: ErrorPageComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}

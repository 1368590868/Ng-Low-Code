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
import { AuthRouterGuard, PermissionRouterGuard } from './shared';

const routes: Routes = [
  { path: '', component: TileComponent, canActivate: [AuthRouterGuard] },
  {
    path: 'about',
    component: AboutComponent,
    canActivate: [AuthRouterGuard]
  },
  {
    path: 'contact',
    component: ContactComponent,
    canActivate: [AuthRouterGuard]
  },
  { path: 'login', component: LoginComponent },
  {
    path: 'site-settings',
    component: SiteSettingsComponent,
    canActivate: [AuthRouterGuard, PermissionRouterGuard]
  },
  {
    path: 'data-dictionaries',
    component: DataDictionaryComponent,
    canActivate: [AuthRouterGuard, PermissionRouterGuard]
  },
  {
    path: 'system-event-logs',
    component: SystemLogComponent,
    canActivate: [AuthRouterGuard, PermissionRouterGuard]
  },
  {
    path: 'portal-item/:name',
    loadChildren: () =>
      import('./features/universal-grid/universal-grid.module').then(
        m => m.UniversalGridModule
      ),
    canActivate: [AuthRouterGuard, PermissionRouterGuard]
  },
  {
    path: 'portal-management',
    loadChildren: () =>
      import('./features/portal-management/portal-management.module').then(
        m => m.PortalManagementModule
      ),
    canActivate: [AuthRouterGuard, PermissionRouterGuard]
  },
  { path: '**', component: ErrorPageComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}

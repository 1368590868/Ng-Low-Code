import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {
  AboutComponent,
  ContactComponent,
  ErrorPageComponent,
  LoginComponent,
  TileComponent,
  SiteSettingsComponent
} from './features/core';
import { RouterGuard } from './shared';

const routes: Routes = [
  { path: '', component: TileComponent, canActivate: [RouterGuard] },
  { path: 'about', component: AboutComponent, canActivate: [RouterGuard] },
  { path: 'contact', component: ContactComponent, canActivate: [RouterGuard] },
  { path: 'login', component: LoginComponent },
  {
    path: 'site-settings',
    component: SiteSettingsComponent,
    canActivate: [RouterGuard]
  },
  {
    path: 'portal-item/:name',
    loadChildren: () =>
      import('./features/universal-grid/universal-grid.module').then(
        m => m.UniversalGridModule
      ),
    canActivate: [RouterGuard]
  },
  {
    path: 'portal-management',
    loadChildren: () =>
      import('./features/portal-management/portal-management.module').then(
        m => m.PortalManagementModule
      ),
    canActivate: [RouterGuard]
  },
  { path: '**', component: ErrorPageComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}

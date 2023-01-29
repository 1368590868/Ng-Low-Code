import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AboutComponent } from './core/components/about/about.component';
import { ContactComponent } from './core/components/contact/contact.component';
import { ErrorPageComponent } from './core/components/error-page/error-page.component';
import { HomeComponent } from './core/components/home/home.component';
import { LoginComponent } from './core/components/login/login.component';
import { TileComponent } from './core/components/tile/tile.component';
import { RouterGuard } from './core/guards/router.guard';

const routes: Routes = [
  { path: '', component: TileComponent, canActivate: [RouterGuard] },
  { path: 'about', component: AboutComponent, canActivate: [RouterGuard] },
  { path: 'contact', component: ContactComponent, canActivate: [RouterGuard] },
  { path: 'login', component: LoginComponent },
  { path: 'error', component: ErrorPageComponent },
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
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}

import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AboutComponent } from './core/components/about/about.component';
import { ContactComponent } from './core/components/contact/contact.component';
import { HomeComponent } from './core/components/home/home.component';

const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'about', component: AboutComponent },
  { path: 'contact', component: ContactComponent },
  {
    path: 'portal-item/:name',
    loadChildren: () =>
      import('./features/universal-grid/universal-grid.module').then(
        m => m.UniversalGridModule
      )
  },
  {
    path: 'portal-management',
    loadChildren: () =>
      import('./features/portal-management/portal-management.module').then(
        m => m.PortalManagementModule
      )
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}

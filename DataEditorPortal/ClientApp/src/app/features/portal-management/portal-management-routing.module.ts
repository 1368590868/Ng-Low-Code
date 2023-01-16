import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PortalListComponent } from './components/portal-list/portal-list.component';

const routes: Routes = [{ path: 'list', component: PortalListComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PortalManagementRoutingModule {}

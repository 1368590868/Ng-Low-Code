import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PortalListComponent } from './components/portal-list/portal-list.component';
import {
  PortalEditComponent,
  PortalEditBasicComponent,
  PortalEditDatasourceComponent,
  PortalEditColumnsComponent,
  PortalEditSearchComponent
} from './components/portal-edit';

const routes: Routes = [
  { path: 'list', component: PortalListComponent },
  { path: 'edit/:id', component: PortalEditComponent },
  {
    path: 'add',
    component: PortalEditComponent,
    children: [
      { path: 'basic', component: PortalEditBasicComponent },
      { path: 'datasource', component: PortalEditDatasourceComponent },
      { path: 'columns', component: PortalEditColumnsComponent },
      { path: 'search', component: PortalEditSearchComponent }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PortalManagementRoutingModule {}

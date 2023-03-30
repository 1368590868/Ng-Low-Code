import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PortalListComponent } from './components/portal-list/portal-list.component';
import {
  PortalEditSingleComponent,
  PortalEditBasicComponent,
  PortalEditDatasourceComponent,
  PortalEditColumnsComponent,
  PortalEditSearchComponent,
  PortalEditFormComponent,
  PortalEditLinkedComponent
} from './components';

const routes: Routes = [
  { path: 'list', component: PortalListComponent },
  {
    path: 'single/:id',
    component: PortalEditSingleComponent,
    children: [
      { path: 'basic', component: PortalEditBasicComponent },
      { path: 'datasource', component: PortalEditDatasourceComponent },
      { path: 'columns', component: PortalEditColumnsComponent },
      { path: 'search', component: PortalEditSearchComponent },
      { path: 'form', component: PortalEditFormComponent }
    ]
  },
  {
    path: 'single',
    component: PortalEditSingleComponent,
    children: [{ path: 'basic', component: PortalEditBasicComponent }]
  },
  {
    path: 'linked/:id',
    component: PortalEditLinkedComponent,
    children: [
      { path: 'basic', component: PortalEditBasicComponent },
      { path: 'datasource', component: PortalEditDatasourceComponent },
      { path: 'search', component: PortalEditSearchComponent }
    ]
  },
  {
    path: 'linked',
    component: PortalEditLinkedComponent,
    children: [{ path: 'basic', component: PortalEditBasicComponent }]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PortalManagementRoutingModule {}

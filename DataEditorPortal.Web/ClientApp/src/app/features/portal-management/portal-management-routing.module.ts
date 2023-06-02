import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PortalListComponent } from './components/portal-list/portal-list.component';
import {
  PortalEditComponent,
  PortalEditBasicComponent,
  PortalEditDatasourceComponent,
  PortalEditColumnsComponent,
  PortalEditSearchComponent,
  PortalEditFormComponent,
  PortalEditLinkComponent,
  PortalEditBasicSubComponent
} from './components';

const routes: Routes = [
  { path: '', redirectTo: 'list', pathMatch: 'full' },
  { path: 'list', component: PortalListComponent },
  // route for adding & editing single table page.
  {
    path: 'edit-single/:id',
    component: PortalEditComponent,
    data: { type: 'single' },
    children: [
      { path: 'basic', component: PortalEditBasicComponent },
      { path: 'datasource', component: PortalEditDatasourceComponent },
      { path: 'columns', component: PortalEditColumnsComponent },
      { path: 'search', component: PortalEditSearchComponent },
      { path: 'form', component: PortalEditFormComponent }
    ]
  },
  {
    path: 'add-single',
    data: { type: 'single' },
    component: PortalEditComponent,
    children: [{ path: 'basic', component: PortalEditBasicComponent }]
  },
  // route for adding & editing linked table page
  {
    path: 'edit-linked/:id',
    component: PortalEditComponent,
    data: { type: 'linked' },
    children: [
      { path: 'basic', component: PortalEditBasicComponent },
      { path: 'datasource', component: PortalEditLinkComponent },
      { path: 'search', component: PortalEditSearchComponent }
    ]
  },
  {
    path: 'add-linked',
    data: { type: 'linked' },
    component: PortalEditComponent,
    children: [{ path: 'basic', component: PortalEditBasicComponent }]
  },
  // route for adding & editing children table of linked table page.
  {
    path: 'edit-linked/:parentId/datasource/add',
    component: PortalEditComponent,
    data: { type: 'linked-single' },
    children: [{ path: 'basic', component: PortalEditBasicSubComponent }]
  },
  {
    path: 'edit-linked/:parentId/datasource/edit/:id',
    component: PortalEditComponent,
    data: { type: 'linked-single' },
    children: [
      { path: 'basic', component: PortalEditBasicSubComponent },
      { path: 'datasource', component: PortalEditDatasourceComponent },
      { path: 'columns', component: PortalEditColumnsComponent },
      { path: 'search', component: PortalEditSearchComponent },
      { path: 'form', component: PortalEditFormComponent }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PortalManagementRoutingModule {}

import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PortalListComponent } from './components/portal-list/portal-list.component';
import {
  PortalEditComponent,
  PortalEditBasicComponent,
  PortalEditDatasourceComponent,
  PortalEditColumnsComponent,
  PortalEditSearchComponent,
  PortalEditFormComponent
} from './components/portal-edit';
import { PortalDictionaryComponent } from './components/portal-dictionary/portal-dictionary.component';

const routes: Routes = [
  { path: 'list', component: PortalListComponent },
  { path: 'dictionary', component: PortalDictionaryComponent },
  {
    path: 'edit/:id',
    component: PortalEditComponent,
    children: [
      { path: 'basic', component: PortalEditBasicComponent },
      { path: 'datasource', component: PortalEditDatasourceComponent },
      { path: 'columns', component: PortalEditColumnsComponent },
      { path: 'search', component: PortalEditSearchComponent },
      { path: 'form', component: PortalEditFormComponent }
    ]
  },
  {
    path: 'add',
    component: PortalEditComponent,
    children: [{ path: 'basic', component: PortalEditBasicComponent }]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PortalManagementRoutingModule {}

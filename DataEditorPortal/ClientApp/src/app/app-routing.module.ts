import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AboutComponent } from './about/about.component';
import { ActionTableComponent } from './action-table/action-table.component';
import { AuthGuard } from './auth/auth.guard';
import { LoginComponent } from './auth/login/login.component';
import { NoPermissionComponent } from './auth/no-permission/no-permission.component';
import { ContactComponent } from './contact/contact.component';
import { HomeComponent } from './home/home.component';

const routes: Routes = [
  {
    path: '',
    canActivate: [AuthGuard],
    children: [
      { path: '', pathMatch: 'full', component: HomeComponent, data: { currentTool: 'NONE' } },
      { path: 'data-correction', component: HomeComponent, data: { currentTool: 'DataCorrections' } },
      // { path: 'about', component: HomeComponent, data: { currentTool: 'About' } },
      // { path: 'contact', component: HomeComponent, data: { currentTool: 'Contact' } },
    ]
  },
  { path: 'about', component: AboutComponent },
  { path: 'contact', component: ContactComponent },
  { path: 'setting/:id', component: ActionTableComponent },
  { path: 'login', component: LoginComponent },
  { path: 'no-permission', component: NoPermissionComponent },
  { path: ':action', pathMatch: 'full', component: HomeComponent, data: { currentTool: 'NONE' }, canActivate: [AuthGuard] },
  { path: ':action/:id', component: HomeComponent, data: { currentTool: 'NONE' }, canActivate: [AuthGuard] } 
]

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

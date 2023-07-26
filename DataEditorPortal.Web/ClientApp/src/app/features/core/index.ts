import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';

import { FormlyModule } from '@ngx-formly/core';

// primeNG components
import { ToastModule } from 'primeng/toast';
import { ButtonModule } from 'primeng/button';
import { MenubarModule } from 'primeng/menubar';
import { AvatarModule } from 'primeng/avatar';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { DividerModule } from 'primeng/divider';
import { CardModule } from 'primeng/card';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { TooltipModule } from 'primeng/tooltip';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TableModule } from 'primeng/table';
import { SkeletonModule } from 'primeng/skeleton';
import { MenuModule } from 'primeng/menu';
import { PaginatorModule } from 'primeng/paginator';
import { TabViewModule } from 'primeng/tabview';
import { EditorModule } from 'primeng/editor';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { ProgressBarModule } from 'primeng/progressbar';

import {
  HeaderComponent,
  NavMenuComponent,
  AboutComponent,
  ContactComponent,
  TileComponent,
  LoginComponent,
  ErrorPageComponent,
  SiteSettingsComponent,
  PersonalDialogComponent,
  DataDictionaryComponent,
  AddDictionaryDialogComponent,
  AddConnectionDialogComponent,
  SystemLogComponent,
  SystemLogDialogComponent,
  DbConnectionComponent,
  SiteGroupComponent,
  AddGroupComponent
} from './components';
import { GroupLayoutComponent } from './layout/group-layout.component';
import { FolderLayoutComponent } from './layout/folder-layout.component';

import { AuthRouterGuard, SharedModule } from 'src/app/shared';

export * from './components';

export const routes: Routes = [
  { path: '', component: TileComponent, canActivate: [AuthRouterGuard] },
  {
    path: 'about',
    component: AboutComponent
  },
  {
    path: 'contact',
    component: ContactComponent
  },
  { path: 'login', component: LoginComponent },
  { path: '**', component: ErrorPageComponent, canActivate: [AuthRouterGuard] }
];

@NgModule({
  declarations: [
    HeaderComponent,
    NavMenuComponent,
    AboutComponent,
    ContactComponent,
    TileComponent,
    LoginComponent,
    ErrorPageComponent,
    SiteSettingsComponent,
    PersonalDialogComponent,
    DataDictionaryComponent,
    AddDictionaryDialogComponent,
    AddConnectionDialogComponent,
    SystemLogComponent,
    SystemLogDialogComponent,
    DbConnectionComponent,
    GroupLayoutComponent,
    FolderLayoutComponent,
    SiteGroupComponent,
    AddGroupComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    HttpClientModule,
    ReactiveFormsModule,
    FormlyModule,
    SharedModule,
    ButtonModule,
    ToastModule,
    MenubarModule,
    AvatarModule,
    DialogModule,
    ProgressSpinnerModule,
    DividerModule,
    InputTextModule,
    CardModule,
    TooltipModule,
    ConfirmDialogModule,
    TableModule,
    SkeletonModule,
    MenuModule,
    PaginatorModule,
    TabViewModule,
    EditorModule,
    InputTextareaModule,
    ProgressBarModule
  ],
  exports: [
    HeaderComponent,
    NavMenuComponent,
    AboutComponent,
    ContactComponent,
    TileComponent,
    SiteSettingsComponent,
    PersonalDialogComponent,
    LoginComponent,
    ErrorPageComponent,
    AddConnectionDialogComponent
  ]
})
export class CoreModule {}

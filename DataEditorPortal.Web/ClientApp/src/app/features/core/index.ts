import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';

import { FormlyModule } from '@ngx-formly/core';

// primeNG components
import { MonacoEditorModule } from 'ngx-monaco-editor';
import { AvatarModule } from 'primeng/avatar';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';
import { DividerModule } from 'primeng/divider';
import { EditorModule } from 'primeng/editor';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { MenuModule } from 'primeng/menu';
import { MenubarModule } from 'primeng/menubar';
import { MultiSelectModule } from 'primeng/multiselect';
import { PaginatorModule } from 'primeng/paginator';
import { ProgressBarModule } from 'primeng/progressbar';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { SkeletonModule } from 'primeng/skeleton';
import { TableModule } from 'primeng/table';
import { TabViewModule } from 'primeng/tabview';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';

import {
  AboutComponent,
  AddConnectionDialogComponent,
  AddDictionaryDialogComponent,
  AddGroupComponent,
  ContactComponent,
  DataDictionaryComponent,
  DbConnectionComponent,
  ErrorPageComponent,
  HeaderComponent,
  LoginComponent,
  NavMenuComponent,
  PersonalDialogComponent,
  SiteGroupComponent,
  SiteSettingsComponent,
  SystemLogComponent,
  SystemLogDialogComponent,
  TileComponent
} from './components';
import { FolderLayoutComponent } from './layout/folder-layout.component';
import { GroupLayoutComponent } from './layout/group-layout.component';

import { SharedModule } from 'src/app/shared';
import {
  AUTH_GUARD_TOKEN,
  HttpConfigModule
} from '../http-config/http-config.module';

export * from './components';

export const routes: Routes = [
  { path: '', component: TileComponent, canActivate: [AUTH_GUARD_TOKEN] },
  {
    path: 'about',
    component: AboutComponent
  },
  {
    path: 'contact',
    component: ContactComponent
  },
  { path: 'login', component: LoginComponent },
  { path: '**', component: ErrorPageComponent, canActivate: [AUTH_GUARD_TOKEN] }
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
    HttpConfigModule.forRoot('windows'),
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
    ProgressBarModule,
    MultiSelectModule,
    MonacoEditorModule.forRoot()
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

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';

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

import {
  HeaderComponent,
  NavMenuComponent,
  AboutComponent,
  ContactComponent,
  HomeComponent,
  TileComponent,
  LoginComponent,
  ErrorPageComponent,
  SiteSettingsComponent,
  PersonalDialogComponent
} from './components';
import { SharedModule } from 'src/app/shared';

export * from './components';

@NgModule({
  declarations: [
    HeaderComponent,
    NavMenuComponent,
    AboutComponent,
    ContactComponent,
    HomeComponent,
    TileComponent,
    LoginComponent,
    ErrorPageComponent,
    SiteSettingsComponent,
    PersonalDialogComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
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
    TooltipModule
  ],
  exports: [
    HeaderComponent,
    NavMenuComponent,
    AboutComponent,
    ContactComponent,
    HomeComponent,
    TileComponent,
    SiteSettingsComponent,
    PersonalDialogComponent,
    LoginComponent,
    ErrorPageComponent
  ]
})
export class CoreModule {}

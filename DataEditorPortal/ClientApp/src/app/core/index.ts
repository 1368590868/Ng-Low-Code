import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { WinAuthInterceptor } from './interceptor/win-auth.interceptor';
import { HttpErrorInterceptor } from './interceptor/http-error.interceptor';

// primeNG components
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { MenubarModule } from 'primeng/menubar';
import { AvatarModule } from 'primeng/avatar';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import {
  HeaderComponent,
  NavMenuComponent,
  AboutComponent,
  ContactComponent,
  HomeComponent,
  TileComponent,
  LoginComponent,
  ErrorPageComponent
} from './components';
import { PermissionDirective } from './directive/permission.directive';
import { CommonModule } from '@angular/common';
import { InputTextModule } from 'primeng/inputtext';
export * from './components';
export { RouterGuard } from './guards/router.guard';
export { ApiResponse } from './models/api-response';
export { NotifyService } from './utils/notify.service';
export { NgxFormlyService } from './services/ngx-formly.service';
export { ConfigDataService } from './services/config-data.service';
import { DialogModule } from 'primeng/dialog';

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
    PermissionDirective
  ],
  imports: [
    CommonModule,
    FormsModule,
    HttpClientModule,
    ButtonModule,
    ToastModule,
    MenubarModule,
    AvatarModule,
    DialogModule,
    ProgressSpinnerModule,
    InputTextModule
  ],
  exports: [
    HeaderComponent,
    NavMenuComponent,
    AboutComponent,
    ContactComponent,
    HomeComponent,
    TileComponent,
    LoginComponent,
    ErrorPageComponent,
    PermissionDirective
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: WinAuthInterceptor,
      multi: true
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: HttpErrorInterceptor,
      multi: true
    },
    MessageService
  ]
})
export class CoreModule {}

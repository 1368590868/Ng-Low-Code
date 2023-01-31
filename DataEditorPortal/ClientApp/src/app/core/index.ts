import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
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
import { DialogModule } from 'primeng/dialog';
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

export * from './components';
export { RouterGuard } from './guards/router.guard';
export { ApiResponse } from './models/api-response';
export { NotifyService } from './utils/notify.service';
export { NgxFormlyService } from './services/ngx-formly.service';

@NgModule({
  declarations: [
    HeaderComponent,
    NavMenuComponent,
    AboutComponent,
    ContactComponent,
    HomeComponent,
    TileComponent,
    LoginComponent,
    ErrorPageComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    HttpClientModule,
    ButtonModule,
    ToastModule,
    MenubarModule,
    AvatarModule,
    DialogModule,
    ProgressSpinnerModule
  ],
  exports: [
    HeaderComponent,
    NavMenuComponent,
    AboutComponent,
    ContactComponent,
    HomeComponent,
    TileComponent,
    LoginComponent,
    ErrorPageComponent
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

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';

import { FormlyModule } from '@ngx-formly/core';

// primeNG components
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { MenubarModule } from 'primeng/menubar';
import { AvatarModule } from 'primeng/avatar';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { DividerModule } from 'primeng/divider';
import { CardModule } from 'primeng/card';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';

// import {
//   HeaderComponent,
//   NavMenuComponent,
//   AboutComponent,
//   ContactComponent,
//   HomeComponent,
//   TileComponent,
//   LoginComponent,
//   ErrorPageComponent,
//   SiteSettingsComponent,
//   PersonalDialogComponent
// } from './components';
import { WinAuthInterceptor } from './interceptor/win-auth.interceptor';
import { HttpErrorInterceptor } from './interceptor/http-error.interceptor';
import { PermissionDirective } from './directive/permission.directive';

// export * from './components';
export { RouterGuard } from './guards/router.guard';
export { ApiResponse } from './models/api-response';
export { NotifyService } from './utils/notify.service';
export { NgxFormlyService } from './services/ngx-formly.service';
export { ConfigDataService } from './services/config-data.service';
export { UserService } from './services/user.service';

@NgModule({
  declarations: [PermissionDirective],
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
    DividerModule,
    InputTextModule,
    CardModule,
    ReactiveFormsModule,
    FormlyModule
  ],
  exports: [PermissionDirective],
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
export class SharedModule {}

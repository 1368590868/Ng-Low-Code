import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';

import { FormlyModule } from '@ngx-formly/core';

// primeNG components
import { MessageService } from 'primeng/api';

import { WinAuthInterceptor } from './interceptor/win-auth.interceptor';
import { HttpErrorInterceptor } from './interceptor/http-error.interceptor';
import { PermissionDirective } from './directive/permission.directive';
import { BooleanTextPipe } from './pipes/boolean-text.pipe';
import { UploadPipe } from './pipes/upload.pipe';

export { AuthRouterGuard } from './guards/auth-router.guard';
export { PermissionRouterGuard } from './guards/permission-router.guard';
export { ApiResponse } from './models/api-response';
export { SiteMenu } from './models/menu';
export { AppUser } from './models/user';
export { DictionaryData } from './models/dictionary';
export { NotifyService } from './utils/notify.service';
export { NgxFormlyService } from './services/ngx-formly.service';
export { ConfigDataService } from './services/config-data.service';
export { UserService } from './services/user.service';
export { DataDictionaryService } from './services/data-dictionary.service';
export { SystemLogService } from './services/system-log.service';
export { SystemLogDialogComponent } from '../features/core/components/system-log/system-log-dialog/system-log-dialog.component';
export * from './models/universal.type';
export { SystemLogData } from '../shared/models/system-log';

@NgModule({
  declarations: [PermissionDirective, BooleanTextPipe, UploadPipe],
  imports: [CommonModule, FormsModule, HttpClientModule, FormlyModule],
  exports: [PermissionDirective, BooleanTextPipe, UploadPipe],
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

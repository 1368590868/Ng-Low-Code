import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';

import { FormlyModule } from '@ngx-formly/core';

// primeNG components
import { MessageService } from 'primeng/api';
import { TooltipModule } from 'primeng/tooltip';

import { WinAuthInterceptor } from './interceptor/win-auth.interceptor';
import { HttpErrorInterceptor } from './interceptor/http-error.interceptor';
import { PermissionDirective } from './directive/permission.directive';
import { BooleanTextPipe } from './pipes/boolean-text.pipe';
import { AttachmentsPipe } from './pipes/attachments.pipe';
import { TemplatePipe } from './pipes/template.pipe';
import { DataFormatService } from './services/data-format.service';
import { AutoFilterDirective } from './directive/auto-filter.directive';

// public components
import { AttachmentsComponent } from './components/attachments/attachments.component';

export { AuthRouterGuard } from './guards/auth-router.guard';
export { AdminPermissionGuard } from './guards/admin-permission.guard';
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
export { DataFormatService } from './services/data-format.service';
export * from './models/universal.type';
export { SystemLogData } from './models/system-log';

@NgModule({
  declarations: [
    PermissionDirective,
    AutoFilterDirective,
    BooleanTextPipe,
    AttachmentsPipe,
    TemplatePipe,
    AttachmentsComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    HttpClientModule,
    FormlyModule,
    TooltipModule
  ],
  exports: [
    PermissionDirective,
    AutoFilterDirective,
    BooleanTextPipe,
    AttachmentsPipe,
    TemplatePipe,
    AttachmentsComponent
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
    MessageService,
    DataFormatService
  ]
})
export class SharedModule {}

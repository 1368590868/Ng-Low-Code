import { CommonModule } from '@angular/common';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { FormlyModule } from '@ngx-formly/core';

// primeNG components
import { MessageService } from 'primeng/api';
import { TooltipModule } from 'primeng/tooltip';

import { HttpErrorInterceptor } from './interceptor/http-error.interceptor';
import { RequestLogInterceptor } from './interceptor/request-log.interceptor';
import { WinAuthInterceptor } from './interceptor/win-auth.interceptor';

import { AttachmentsPipe } from './pipes/attachments.pipe';
import { BooleanTextPipe } from './pipes/boolean-text.pipe';
import { NumeralPipe } from './pipes/numeral.pipe';
import { TemplatePipe } from './pipes/template.pipe';

import { AutoFilterDirective } from './directive/auto-filter.directive';
import { DropdownFixDirective } from './directive/dropdown-fix.directive';
import { MonacoEditorDirective } from './directive/monaco-editor.directive';
import { PermissionDirective } from './directive/permission.directive';
import { TableDirective } from './directive/table.directive';

// public components
import { AttachmentsComponent } from './components/attachments/attachments.component';
import { LoadingComponent } from './components/loading/loading.component';
import { DialogFocusDirective } from './directive/dialog-focus.directive';
import { ConfigDataService, DataFormatService } from './services';
import { registerNumeral, registerQuill } from './utils';

export * from './guards';
export * from './models';
export * from './services';

registerNumeral();
registerQuill();

@NgModule({
  declarations: [
    PermissionDirective,
    AutoFilterDirective,
    DropdownFixDirective,
    MonacoEditorDirective,
    DialogFocusDirective,
    TableDirective,
    BooleanTextPipe,
    AttachmentsPipe,
    TemplatePipe,
    NumeralPipe,
    AttachmentsComponent,
    LoadingComponent
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
    DropdownFixDirective,
    MonacoEditorDirective,
    DialogFocusDirective,
    TableDirective,
    BooleanTextPipe,
    AttachmentsPipe,
    TemplatePipe,
    NumeralPipe,
    AttachmentsComponent,
    LoadingComponent
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: RequestLogInterceptor,
      multi: true
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: HttpErrorInterceptor,
      multi: true
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: WinAuthInterceptor,
      multi: true
    },
    MessageService,
    DataFormatService
  ]
})
export class SharedModule {
  constructor(private configDataService: ConfigDataService) {
    this.configDataService.calcDropdownItemSize();
  }
}

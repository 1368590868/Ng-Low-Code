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
import { globalLoadingInterceptor } from './interceptor/global-loading.interceptor';

import { BooleanTextPipe } from './pipes/boolean-text.pipe';
import { AttachmentsPipe } from './pipes/attachments.pipe';
import { TemplatePipe } from './pipes/template.pipe';
import { NumeralPipe } from './pipes/numeral.pipe';

import { AutoFilterDirective } from './directive/auto-filter.directive';
import { DropdownFixDirective } from './directive/dropdown-fix.directive';
import { MonacoEditorDirective } from './directive/monaco-editor.directive';
import { TableDirective } from './directive/table.directive';
import { PermissionDirective } from './directive/permission.directive';

// public components
import { AttachmentsComponent } from './components/attachments/attachments.component';
import { GlobalLoadingComponent } from './components/global-loading/global-loading.component';
import { registerNumeral, registerQuill } from './utils';
import { ConfigDataService, DataFormatService } from './services';

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
    TableDirective,
    BooleanTextPipe,
    AttachmentsPipe,
    TemplatePipe,
    NumeralPipe,
    AttachmentsComponent,
    GlobalLoadingComponent
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
    TableDirective,
    BooleanTextPipe,
    AttachmentsPipe,
    TemplatePipe,
    NumeralPipe,
    AttachmentsComponent,
    GlobalLoadingComponent
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: globalLoadingInterceptor,
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

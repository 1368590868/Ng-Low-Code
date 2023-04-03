import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { FormlyModule } from '@ngx-formly/core';
import { FormlyFormFieldModule } from '@ngx-formly/primeng/form-field';
import { FormlyFieldFileUploadComponent } from './file-upload.component';
import { FileUploadModule } from 'primeng/fileupload';
import { FileUploadComponent } from './file-upload.component';
import { TableModule } from 'primeng/table';
@NgModule({
  declarations: [FileUploadComponent, FormlyFieldFileUploadComponent],
  imports: [
    TableModule,
    CommonModule,
    ReactiveFormsModule,
    FileUploadModule,
    FormlyFormFieldModule,
    FormlyModule.forChild({
      types: [
        {
          name: 'fileUpload',
          component: FormlyFieldFileUploadComponent,
          wrappers: ['form-field']
        }
      ]
    })
  ]
})
export class FormlyFileUploadModule {}
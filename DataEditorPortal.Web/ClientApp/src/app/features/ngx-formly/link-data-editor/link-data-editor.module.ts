import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { FormlyModule } from '@ngx-formly/core';
import { InputNumberModule } from 'primeng/inputnumber';
import { FormlyFieldLinkDataEditorComponent } from './link-data-editor.type';
import { LinkDataTableComponent } from './link-data-table/link-data-table.component';
import { TableModule } from 'primeng/table';
import { SharedModule } from 'src/app/shared';

@NgModule({
  declarations: [FormlyFieldLinkDataEditorComponent, LinkDataTableComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InputNumberModule,
    TableModule,
    FormlyModule.forChild({
      types: [
        {
          name: 'linkDataEditor',
          component: FormlyFieldLinkDataEditorComponent,
          wrappers: ['form-field']
        }
      ]
    }),
    SharedModule
  ]
})
export class FormlyLinkDataEditorModule {}

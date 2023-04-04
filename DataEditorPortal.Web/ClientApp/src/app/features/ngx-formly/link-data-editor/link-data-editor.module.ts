import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { FormlyModule } from '@ngx-formly/core';
import { InputNumberModule } from 'primeng/inputnumber';
import { FormlyFieldLinkDataEditorComponent } from './link-data-editor.type';

@NgModule({
  declarations: [FormlyFieldLinkDataEditorComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InputNumberModule,
    FormlyModule.forChild({
      types: [
        {
          name: 'linkDataEditor',
          component: FormlyFieldLinkDataEditorComponent,
          wrappers: ['form-field']
        }
      ]
    })
  ]
})
export class FormlyLinkDataEditorModule {}

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormlyModule } from '@ngx-formly/core';
import { ReactiveFormsModule } from '@angular/forms';
import { FormlySelectModule } from '@ngx-formly/core/select';
import { CheckboxModule } from 'primeng/checkbox';
import { FormlyFormFieldModule } from '@ngx-formly/primeng/form-field';
import { FormlyFieldCheckBoxComponent } from './checkbox.type';

@NgModule({
  declarations: [FormlyFieldCheckBoxComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CheckboxModule,

    FormlyFormFieldModule,
    FormlySelectModule,
    FormlyModule.forChild({
      types: [
        {
          name: 'checkbox',
          component: FormlyFieldCheckBoxComponent,
          wrappers: ['form-field']
        }
      ]
    })
  ]
})
export class FormlyCheckBoxModule {}

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormlyModule } from '@ngx-formly/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MultiSelectModule } from 'primeng/multiselect';
import { FormlyFormFieldModule } from '@ngx-formly/primeng/form-field';
import { FormlySelectModule } from '@ngx-formly/core/select';
import { FormlyFieldMultiSelectComponent } from './multiselect.type';

@NgModule({
  declarations: [FormlyFieldMultiSelectComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MultiSelectModule,

    FormlyFormFieldModule,
    FormlyModule.forChild({
      types: [
        {
          name: 'multiSelect',
          component: FormlyFieldMultiSelectComponent,
          wrappers: ['form-field']
        }
      ]
    }),
    FormlySelectModule
  ]
})
export class FormlyMultiSelectModule {}

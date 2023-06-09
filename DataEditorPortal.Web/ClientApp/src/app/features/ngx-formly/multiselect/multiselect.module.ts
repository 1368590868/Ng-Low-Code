import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormlyModule } from '@ngx-formly/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MultiSelectModule } from 'primeng/multiselect';
import { FormlySelectModule } from '@ngx-formly/core/select';
import { FormlyFieldMultiSelectComponent } from './multiselect.type';
import { SharedModule } from 'src/app/shared';

@NgModule({
  declarations: [FormlyFieldMultiSelectComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MultiSelectModule,
    FormlyModule.forChild({
      types: [
        {
          name: 'multiSelect',
          component: FormlyFieldMultiSelectComponent,
          wrappers: ['form-field']
        }
      ]
    }),
    FormlySelectModule,
    SharedModule
  ]
})
export class FormlyMultiSelectModule {}

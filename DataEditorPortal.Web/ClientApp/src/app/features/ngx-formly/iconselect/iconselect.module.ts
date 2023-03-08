import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { FormlyModule } from '@ngx-formly/core';
import { DropdownModule } from 'primeng/dropdown';
import { FormlySelectModule as FormlyCoreSelectModule } from '@ngx-formly/core/select';

import { FormlyFormFieldModule } from '@ngx-formly/primeng/form-field';
import { FormlyFieldIconSelectComponent } from './iconselect.type';

@NgModule({
  declarations: [FormlyFieldIconSelectComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DropdownModule,

    FormlyFormFieldModule,
    FormlyCoreSelectModule,
    FormlyModule.forChild({
      types: [
        {
          name: 'iconSelect',
          component: FormlyFieldIconSelectComponent,
          wrappers: ['form-field']
        },
        { name: 'enum', extends: 'select' }
      ]
    })
  ]
})
export class FormlyIconSelectModule {}

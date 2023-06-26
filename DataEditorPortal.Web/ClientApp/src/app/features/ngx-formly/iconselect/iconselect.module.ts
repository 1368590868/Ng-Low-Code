import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { FormlyModule } from '@ngx-formly/core';
import { DropdownModule } from 'primeng/dropdown';
import { FormlySelectModule as FormlyCoreSelectModule } from '@ngx-formly/core/select';
import { IconSelectComponent } from './iconselect.component';
import { ButtonModule } from 'primeng/button';

import { FormlyFieldIconSelectComponent } from './iconselect.type';

@NgModule({
  declarations: [IconSelectComponent, FormlyFieldIconSelectComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DropdownModule,
    FormlyCoreSelectModule,
    ButtonModule,
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
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class FormlyIconSelectModule {}

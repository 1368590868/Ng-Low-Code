import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { FormlyModule } from '@ngx-formly/core';
import { DropdownModule } from 'primeng/dropdown';
import { FormlySelectModule as FormlyCoreSelectModule } from '@ngx-formly/core/select';
import { IconSelectComponent } from './iconselect.component';
import { ButtonModule } from 'primeng/button';
import { AvatarModule } from 'primeng/avatar';
import { FileUploadModule } from 'primeng/fileupload';

import { FormlyFieldIconSelectComponent } from './iconselect.type';
import { SharedModule } from 'src/app/shared';

@NgModule({
  declarations: [IconSelectComponent, FormlyFieldIconSelectComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DropdownModule,
    FormlyCoreSelectModule,
    ButtonModule,
    AvatarModule,
    FileUploadModule,
    SharedModule,
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

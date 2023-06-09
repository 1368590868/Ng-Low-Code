import { NgModule } from '@angular/core';
import { AsyncPipe, CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { FormlyModule } from '@ngx-formly/core';
import { DropdownModule } from 'primeng/dropdown';
import { SharedModule } from 'src/app/shared';
import {
  FormlySelectModule as FormlyCoreSelectModule,
  FormlySelectOptionsPipe
} from '@ngx-formly/core/select';
import { FormlyFieldSelectComponent } from './select.type';

@NgModule({
  declarations: [FormlyFieldSelectComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DropdownModule,
    FormlyCoreSelectModule,
    FormlyModule.forChild({
      types: [
        {
          name: 'select',
          component: FormlyFieldSelectComponent,
          wrappers: ['form-field']
        },
        { name: 'enum', extends: 'select' }
      ]
    }),
    SharedModule
  ],
  providers: [FormlySelectOptionsPipe, AsyncPipe]
})
export class FormlySelectModule {}

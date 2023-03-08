import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { FormlyModule } from '@ngx-formly/core';
import { InputMaskModule } from 'primeng/inputmask';

import { FormlyFormFieldModule } from '@ngx-formly/primeng/form-field';
import { FormlyFieldInputMaskComponent } from './input-mask.type';

@NgModule({
  declarations: [FormlyFieldInputMaskComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InputMaskModule,

    FormlyFormFieldModule,
    FormlyModule.forChild({
      types: [
        {
          name: 'inputMask',
          component: FormlyFieldInputMaskComponent,
          wrappers: ['form-field']
        }
      ]
    })
  ]
})
export class FormlyInputMaskModule {}

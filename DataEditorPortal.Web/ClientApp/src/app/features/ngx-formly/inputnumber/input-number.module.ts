import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { FormlyModule } from '@ngx-formly/core';
import { InputNumberModule } from 'primeng/inputnumber';
import { FormlyFieldInputNumberComponent } from './input-number.type';

@NgModule({
  declarations: [FormlyFieldInputNumberComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InputNumberModule,
    FormlyModule.forChild({
      types: [
        {
          name: 'inputNumber',
          component: FormlyFieldInputNumberComponent,
          wrappers: ['form-field']
        }
      ]
    })
  ]
})
export class FormlyInputNumberModule {}

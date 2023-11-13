import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormlyModule } from '@ngx-formly/core';
import { ReactiveFormsModule } from '@angular/forms';
import { FormlyWrapperFormFieldMultipleComponent } from './form-field-multiple.wrapper';
import { TooltipModule } from 'primeng/tooltip';
import { CheckboxModule } from 'primeng/checkbox';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';

@NgModule({
  declarations: [FormlyWrapperFormFieldMultipleComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TooltipModule,
    CheckboxModule,
    FormsModule,
    InputTextModule,
    FormlyModule.forChild({
      wrappers: [
        {
          name: 'form-field-multiple',
          component: FormlyWrapperFormFieldMultipleComponent
        }
      ]
    })
  ]
})
export class FormlyFormFieldMultipleModule {}

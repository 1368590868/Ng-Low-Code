import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FormlyModule } from '@ngx-formly/core';
import { SharedModule } from 'primeng/api';
import { CheckboxModule } from 'primeng/checkbox';
import { InputTextModule } from 'primeng/inputtext';
import { TooltipModule } from 'primeng/tooltip';
import { FormlyWrapperFormFieldMultipleComponent } from './form-field-multiple.wrapper';

@NgModule({
  declarations: [FormlyWrapperFormFieldMultipleComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TooltipModule,
    CheckboxModule,
    FormsModule,
    InputTextModule,
    SharedModule,
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

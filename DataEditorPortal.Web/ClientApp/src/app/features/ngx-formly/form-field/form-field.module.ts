import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormlyModule } from '@ngx-formly/core';
import { ReactiveFormsModule } from '@angular/forms';
import { FormlyWrapperFormFieldComponent } from './form-field.wrapper';
import { TooltipModule } from 'primeng/tooltip';

@NgModule({
  declarations: [FormlyWrapperFormFieldComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TooltipModule,
    FormlyModule.forChild({
      wrappers: [
        {
          name: 'form-field',
          component: FormlyWrapperFormFieldComponent
        }
      ]
    })
  ]
})
export class FormlyFormFieldModule {}

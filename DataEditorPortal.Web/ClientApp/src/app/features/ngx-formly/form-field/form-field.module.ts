import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { FormlyModule } from '@ngx-formly/core';
import { TooltipModule } from 'primeng/tooltip';
import { SharedModule } from 'src/app/shared';
import { FormlyWrapperFormFieldComponent } from './form-field.wrapper';

@NgModule({
  declarations: [FormlyWrapperFormFieldComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TooltipModule,
    SharedModule,
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

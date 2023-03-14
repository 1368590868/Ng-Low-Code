import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormlyModule } from '@ngx-formly/core';
import { ReactiveFormsModule } from '@angular/forms';
import { FormlySelectModule } from '@ngx-formly/core/select';
import { TriStateCheckboxModule } from 'primeng/tristatecheckbox';
import { FormlyFormFieldModule } from '@ngx-formly/primeng/form-field';
import { FormlyFieldTriStateCheckBoxComponent } from './triStateCheckbox.type';

@NgModule({
  declarations: [FormlyFieldTriStateCheckBoxComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TriStateCheckboxModule,

    FormlyFormFieldModule,
    FormlySelectModule,
    FormlyModule.forChild({
      types: [
        {
          name: 'triStateCheckbox',
          component: FormlyFieldTriStateCheckBoxComponent,
          wrappers: ['form-field']
        }
      ]
    })
  ]
})
export class FormlyTriStateCheckBoxModule {}

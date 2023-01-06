import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormlyModule } from '@ngx-formly/core';
import { ReactiveFormsModule } from '@angular/forms';
import { CalendarModule } from 'primeng/calendar';
import { FormlyFormFieldModule } from '@ngx-formly/primeng/form-field';
import { FormlyFieldDatepickerComponent } from './datepicker.type';

@NgModule({
  declarations: [FormlyFieldDatepickerComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CalendarModule,

    FormlyFormFieldModule,
    FormlyModule.forChild({
      types: [
        {
          name: 'datepicker',
          component: FormlyFieldDatepickerComponent,
          wrappers: ['form-field']
        }
      ]
    })
  ]
})
export class FormlyDatepickerModule {}

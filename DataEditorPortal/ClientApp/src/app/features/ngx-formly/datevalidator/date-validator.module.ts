import { NgModule } from '@angular/core';
import { FormlyModule } from '@ngx-formly/core';
import { getValidationMessages, getValidators } from './date-validator';

@NgModule({
  imports: [
    FormlyModule.forChild({
      validationMessages: getValidationMessages(),
      validators: getValidators()
    })
  ]
})
export class DateValidatorModule {}

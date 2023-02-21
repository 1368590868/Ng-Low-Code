import { NgModule } from '@angular/core';
import { FormlyModule } from '@ngx-formly/core';
import { UnivaersalValidator } from './universal-regexp';

const validators = UnivaersalValidator.getValidators();

const formlyConfig = {
  validationMessages: [
    { name: 'currentDate', message: 'Invalid date' },
    ...UnivaersalValidator.getValidationMessages()
  ],
  validators
};

@NgModule({
  imports: [FormlyModule.forChild(formlyConfig)],
  providers: [
    { provide: 'FormlyValidators', multi: true, useValue: validators }
  ]
})
export class UniversalRegexpModule {}

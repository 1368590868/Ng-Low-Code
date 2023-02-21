import { NgModule } from '@angular/core';
import { FormlyModule } from '@ngx-formly/core';

import { AppValidator } from './current-date';

const validators = AppValidator.getValidators();

const formlyConfig = {
  validationMessages: [{ name: 'currentDate', message: 'Invalid date' }],
  validators
};

@NgModule({
  imports: [FormlyModule.forChild(formlyConfig)],
  providers: [
    { provide: 'FormlyValidators', multi: true, useValue: validators }
  ]
})
export class CurrentDateModule {}

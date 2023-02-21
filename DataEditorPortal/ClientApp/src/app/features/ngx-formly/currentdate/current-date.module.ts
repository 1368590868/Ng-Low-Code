import { NgModule } from '@angular/core';
import { FormlyModule } from '@ngx-formly/core';
import { getValidators } from './current-date';

@NgModule({
  imports: [
    FormlyModule.forChild({
      validationMessages: [{ name: 'currentDate', message: 'Invalid date' }],
      validators: getValidators()
    })
  ]
})
export class CurrentDateModule {}

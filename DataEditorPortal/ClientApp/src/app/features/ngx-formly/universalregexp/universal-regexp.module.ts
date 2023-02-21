import { NgModule } from '@angular/core';
import { FormlyModule } from '@ngx-formly/core';
import { UniversalRegexp } from './universal-regexp';
@NgModule({
  imports: [
    FormlyModule.forChild({
      validationMessages: [...UniversalRegexp.getValidationMessages()],
      validators: UniversalRegexp.getValidators()
    })
  ]
})
export class UniversalRegexpModule {}

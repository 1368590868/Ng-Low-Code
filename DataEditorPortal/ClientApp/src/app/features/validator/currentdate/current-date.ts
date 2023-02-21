import { AbstractControl, ValidationErrors } from '@angular/forms';
export class AppValidator {
  static currentDateValidator = () => {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      if (
        value != null &&
        control.value.toLocaleDateString() !== new Date().toLocaleDateString()
      ) {
        return { currentDate: true };
      }
      return null;
    };
  };

  static getValidators() {
    return [{ name: 'currentDate', validation: this.currentDateValidator() }];
  }
}

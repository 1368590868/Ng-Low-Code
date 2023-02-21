import { AbstractControl, ValidationErrors } from '@angular/forms';

export const currentDateValidator = () => {
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

export const getValidators = () => {
  return [{ name: 'currentDate', validation: currentDateValidator() }];
};

export const getValidationMessages = () => {
  return [{ name: 'currentDate', message: 'Invalid date' }];
};

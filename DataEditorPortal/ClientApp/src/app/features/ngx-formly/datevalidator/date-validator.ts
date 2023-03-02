import { AbstractControl, ValidationErrors } from '@angular/forms';

const currentDate = new Date().toLocaleDateString();

const beforeTodayValidator = () => {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = new Date(control.value).toLocaleDateString();
    console.log(value, currentDate);
    if (value != null && value < currentDate) {
      return null;
    }
    return { beforetoday: true };
  };
};

const afterTodayValidator = () => {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = new Date(control.value).toLocaleDateString();
    console.log(value, currentDate);
    if (value != null && value > currentDate) {
      return null;
    }
    return { aftertoday: true };
  };
};

const beforeIsTodayValidator = () => {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = new Date(control.value).toLocaleDateString();
    console.log(value, currentDate);
    if (value != null && value <= currentDate) {
      return null;
    }
    return { beforetoday: true };
  };
};

const afterIsTodayValidator = () => {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = new Date(control.value).toLocaleDateString();
    console.log(value, currentDate);
    if (value != null && value >= currentDate) {
      return null;
    }
    return { aftertoday: true };
  };
};

export const getValidators = () => {
  return [
    {
      name: 'beforetoday',
      options: { label: 'Before Today' },
      validation: beforeTodayValidator()
    },
    {
      name: 'aftertoday',
      options: { label: 'After Today' },
      validation: afterTodayValidator()
    },
    {
      name: 'beforeistoday',
      options: { label: 'Before or is Today' },
      validation: beforeIsTodayValidator()
    },
    {
      name: 'afteristoday',
      options: { label: 'After or is Today' },
      validation: afterIsTodayValidator()
    }
  ];
};

export const getValidationMessages = () => {
  return [
    { name: 'beforetoday', message: 'Invalid date' },
    { name: 'aftertoday', message: 'Invalid date' },
    { name: 'beforeistoday', message: 'Invalid date' },
    { name: 'afteristoday', message: 'Invalid date' }
  ];
};

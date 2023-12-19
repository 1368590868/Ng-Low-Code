import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

interface ValidatorsArr {
  name: string;
  label: string;
  pattern: RegExp;
  message: string;
}

export class UniversalRegexp {
  static validators: ValidatorsArr[] = [
    {
      name: 'url',
      label: 'Url',
      pattern: /^(((ht|f)tps?):\/\/)?([^!@#$%^&*?.\s-]([^!@#$%^&*?.\s]{0,63}[^!@#$%^&*?.\s])?\.)+[a-z]{2,6}\/?/,
      message: 'Invalid URL'
    },
    {
      name: 'email',
      label: 'Email',
      pattern:
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
      message: 'Invalid Email'
    }
  ];

  static getValidationMessages(): { name: string; message: string }[] {
    return this.validators.reduce<any>((res, vld) => {
      res.push({ name: vld.name, message: vld.message });
      return res;
    }, []);
  }

  static createValidator = (validators: ValidatorsArr) => {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      if (value && !validators.pattern.test(value)) {
        return { [validators.name]: true };
      }
      return null;
    };
  };

  static getValidators(): { name: string; validation: ValidatorFn }[] {
    return this.validators.reduce<any>((res, vld) => {
      res.push({
        name: vld.name,
        options: { label: vld.label },
        validation: this.createValidator(vld)
      });
      return res;
    }, []);
  }
}

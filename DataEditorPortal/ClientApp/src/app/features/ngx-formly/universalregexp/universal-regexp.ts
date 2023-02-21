import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

interface ValidatorsArr {
  name: string;
  pattern: RegExp;
  message: string;
}

export class UnivaersalValidator {
  static validators: ValidatorsArr[] = [
    {
      name: 'ip',
      pattern:
        /^((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.){3}(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])(?::(?:[0-9]|[1-9][0-9]{1,3}|[1-5][0-9]{4}|6[0-4][0-9]{3}|65[0-4][0-9]{2}|655[0-2][0-9]|6553[0-5]))?$/,
      message: 'Invalid IP address'
    },
    {
      name: 'url',
      pattern:
        /^(((ht|f)tps?):\/\/)?([^!@#$%^&*?.\s-]([^!@#$%^&*?.\s]{0,63}[^!@#$%^&*?.\s])?\.)+[a-z]{2,6}\/?/,
      message: 'Invalid URL'
    },
    {
      name: 'name',
      pattern: /(^[a-zA-Z][a-zA-Z\s]{0,20}[a-zA-Z]$)/,
      message: 'Invalid name'
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
      res.push({ name: vld.name, validation: this.createValidator(vld) });
      return res;
    }, []);
  }
}

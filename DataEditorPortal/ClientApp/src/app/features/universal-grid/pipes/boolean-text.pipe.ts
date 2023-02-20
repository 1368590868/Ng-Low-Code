import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'booleanText' })
export class BooleanTextPipe implements PipeTransform {
  transform(value: boolean): string {
    return value === true ? 'Yes' : value === false ? 'No' : value;
  }
}

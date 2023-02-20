import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'booleanText' })
export class BooleanTextPipe implements PipeTransform {
  transform(value: boolean): string {
    console.log(value);
    return value === true ? 'Yes' : value === false ? 'No' : value;
  }
}

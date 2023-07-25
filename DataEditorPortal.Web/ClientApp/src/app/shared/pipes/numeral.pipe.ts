import { Pipe, PipeTransform } from '@angular/core';
import * as numeral from 'numeral';

@Pipe({
  name: 'numeral'
})
export class NumeralPipe implements PipeTransform {
  transform(value: any, format = '0.00'): string {
    const myNumeral = numeral(value).format(format);
    return myNumeral;
  }
}

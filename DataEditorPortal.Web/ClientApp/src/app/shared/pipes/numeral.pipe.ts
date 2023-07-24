import { Pipe, PipeTransform } from '@angular/core';
import { DataFormatService } from '../services/data-format.service';
import * as numeral from 'numeral';

@Pipe({
  name: 'numeral'
})
export class NumeralPipe implements PipeTransform {
  formatters?: any;
  constructor(private dataFormatService: DataFormatService) {
    this.formatters = this.dataFormatService.getFormatters();
  }
  transform(value: any, format = '0.00'): number {
    const myNumeral: any = numeral(value).format(format);
    return myNumeral;
  }
}

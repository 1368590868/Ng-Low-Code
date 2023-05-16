import { Inject, Pipe, PipeTransform } from '@angular/core';
import { DataFormatService } from '../services/data-format.service';
import { evalExpression, evalStringExpression } from '../utils';

@Pipe({
  name: 'template'
})
export class TemplatePipe implements PipeTransform {
  formatters?: any;
  constructor(private dataFormatService: DataFormatService) {
    this.formatters = this.dataFormatService.getFormatters();
  }
  transform(value: any, template: string): number {
    const expression = evalStringExpression(template, ['$rowData', 'Pipes']);
    return evalExpression(expression, value, [value, this.formatters]);
  }
}

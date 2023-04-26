import {
  DatePipe,
  DecimalPipe,
  CurrencyPipe,
  PercentPipe
} from '@angular/common';
import { Inject, Injectable, LOCALE_ID } from '@angular/core';

@Injectable()
export class DataFormatService {
  constructor(
    @Inject(LOCALE_ID) private locale: string,
    private datePipe: DatePipe,
    private decimalPipe: DecimalPipe,
    private currencyPipe: CurrencyPipe,
    private percentPipe: PercentPipe
  ) {}

  getFormatters() {
    return {
      locale: this.locale,
      date: this.datePipe,
      number: this.decimalPipe,
      currency: this.currencyPipe,
      percent: this.percentPipe
    };
  }
}

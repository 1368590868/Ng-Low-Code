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
      date: this.datePipe.transform,
      number: this.decimalPipe.transform,
      currency: this.currencyPipe.transform,
      percent: this.percentPipe.transform
    };
  }
}

import { CurrencyPipe, DatePipe, DecimalPipe, PercentPipe } from '@angular/common';
import { Inject, Injectable, LOCALE_ID } from '@angular/core';
import { GuidPipe } from '../pipes/guid.pipe';

@Injectable()
export class DataFormatService {
  constructor(
    @Inject(LOCALE_ID) private locale: string,
    private datePipe: DatePipe,
    private decimalPipe: DecimalPipe,
    private currencyPipe: CurrencyPipe,
    private percentPipe: PercentPipe,
    private guidPipe: GuidPipe
  ) {}

  getFormatters() {
    return {
      locale: this.locale,
      date: this.datePipe,
      number: this.decimalPipe,
      currency: this.currencyPipe,
      percent: this.percentPipe,
      guid: this.guidPipe
    };
  }
}

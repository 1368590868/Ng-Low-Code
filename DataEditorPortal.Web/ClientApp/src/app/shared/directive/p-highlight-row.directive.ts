import { Directive, HostBinding, HostListener, Input } from '@angular/core';
import { Table } from 'primeng/table';

@Directive({
  // eslint-disable-next-line @angular-eslint/directive-selector
  selector: '[pHighlightRow],[p-highlight-row]'
})
export class PTableHighlightRowDirective {
  constructor(public dt: Table) {}

  get selected(): boolean | undefined {
    return (this.dt as any).highlightRowId === this.data[this.dt.dataKey];
  }

  @Input('pHighlightRow') data: any;

  @HostBinding('attr.data-p-highlight-row')
  get attrData() {
    return this.selected;
  }

  @HostBinding('class.p-highlight')
  get highlight() {
    return this.selected;
  }

  @HostListener('click', ['$event'])
  onClick() {
    (this.dt as any).highlightRowId = this.data[this.dt.dataKey];
  }
}

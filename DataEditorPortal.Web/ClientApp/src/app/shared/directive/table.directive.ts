import {
  AfterViewChecked,
  ChangeDetectorRef,
  Directive,
  Host,
  Optional,
  Self
} from '@angular/core';
import { Table } from 'primeng/table';

@Directive({
  // eslint-disable-next-line @angular-eslint/directive-selector
  selector: 'p-table'
})
export class TableDirective implements AfterViewChecked {
  private hasClientHeight = false;

  constructor(
    @Host() @Self() @Optional() private table: Table,
    private cdr: ChangeDetectorRef
  ) {}

  ngAfterViewChecked(): void {
    if (!this.hasClientHeight && this.table.virtualScroll) {
      if(!this.table.containerViewChild) return;
      const rows = this.table.containerViewChild.nativeElement.querySelectorAll(
        '.p-datatable .p-datatable-tbody > tr:not(.empty-message)'
      );

      if (rows.length > 0 && rows[0].clientHeight) {
        this.table.virtualScrollItemSize = rows[0].clientHeight;
        this.hasClientHeight = true;
        this.cdr.detectChanges();
      }
    }
  }
}

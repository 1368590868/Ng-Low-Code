import { Directive, EventEmitter, Input, Output } from '@angular/core';

@Directive({
  selector: '[appGridAction]'
})
export class GridActionDirective {
  @Input() fetchDataParam: any;
  @Input() selectedRecords: any = [];
  @Input() recordKey!: string;
  @Input() gridName!: string;
  @Input() initParams: any;

  @Output() loadedEvent = new EventEmitter<void>();
  @Output() savedEvent = new EventEmitter<void>();
  @Output() errorEvent = new EventEmitter<void>();
}

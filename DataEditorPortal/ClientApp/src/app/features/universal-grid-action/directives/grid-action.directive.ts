import { Directive, EventEmitter, Input, Output } from '@angular/core';

export interface OnGridActionSave {
  onSave: () => void;
}

export interface OnGridActionCancel {
  onCancel: () => void;
}

export interface OnGridActionDialogShow {
  onDialogShow: () => void;
}

@Directive({
  selector: '[appGridAction]'
})
export class GridActionDirective {
  @Input() fetchDataParam: any;
  @Input() selectedRecords: any = [];
  @Input() recordKey = 'Id';

  @Output() loadedEvent = new EventEmitter<void>();
  @Output() savedEvent = new EventEmitter<void>();
  @Output() errorEvent = new EventEmitter<void>();
}

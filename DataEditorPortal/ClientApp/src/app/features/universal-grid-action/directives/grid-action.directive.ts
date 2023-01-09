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
  @Input() label = 'Add New';
  @Input() icon = 'pi pi-plus';

  @Input() header = 'Add / Edit';
  @Input() okText = 'Ok';
  @Input() cancelText = 'Cancel';
  @Output() savedEvent = new EventEmitter<void>();
  @Output() errorEvent = new EventEmitter<void>();
}

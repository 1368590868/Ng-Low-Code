import { Directive, Input } from '@angular/core';

@Directive({
  selector: '[appGridAction]'
})
export class GridActionDirective {
  @Input() label = 'Add New';
  @Input() icon = 'pi pi-plus';

  @Input() header = 'Add / Edit';
  @Input() okText = 'Ok';
  @Input() cancelText = 'Cancel';

  // constructor() {}
}

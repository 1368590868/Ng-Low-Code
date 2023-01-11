import { Component } from '@angular/core';
import { GridActionDirective } from '../../directives/grid-action.directive';

@Component({
  selector: 'app-remove-action',
  templateUrl: './remove-action.component.html',
  styleUrls: ['./remove-action.component.scss']
})
export class RemoveActionComponent extends GridActionDirective {
  onSave(): void {
    setTimeout(() => {
      this.savedEvent.emit();
    }, 1000);
  }

  onCancel(): void {
    console.log('cancel');
  }
}

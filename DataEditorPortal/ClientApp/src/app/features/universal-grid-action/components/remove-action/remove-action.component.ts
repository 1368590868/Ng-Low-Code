import { Component } from '@angular/core';
import { NotifyService } from 'src/app/core/utils/notify.service';
import { GridActionDirective } from '../../directives/grid-action.directive';
import { RemoveActionService } from '../../services/remove-services/remove-action.service';

@Component({
  selector: 'app-remove-action',
  templateUrl: './remove-action.component.html',
  styleUrls: ['./remove-action.component.scss']
})
export class RemoveActionComponent extends GridActionDirective {
  constructor(
    private removeActionService: RemoveActionService,
    private notifyService: NotifyService
  ) {
    super();
  }
  onSave(): void {
    this.removeActionService
      .removeTableData(this.selectedRecords)
      .subscribe(res => {
        if (!res.isError && res.result) {
          this.notifyService.notifySuccess('Success', 'Remove Success');
          this.savedEvent.emit();
        } else {
          this.errorEvent.emit();
        }
      });
  }

  onCancel(): void {
    console.log('cancel');
  }
}

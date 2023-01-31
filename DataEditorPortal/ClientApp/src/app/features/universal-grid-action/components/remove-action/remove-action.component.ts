import { Component } from '@angular/core';
import { NotifyService } from 'src/app/core';
import { GridActionDirective } from '../../directives/grid-action.directive';
import { UniversalGridService } from '../../services/universal-grid.service';

@Component({
  selector: 'app-remove-action',
  templateUrl: './remove-action.component.html',
  styleUrls: ['./remove-action.component.scss']
})
export class RemoveActionComponent extends GridActionDirective {
  constructor(
    private gridService: UniversalGridService,
    private notifyService: NotifyService
  ) {
    super();
  }

  onSave(): void {
    this.gridService
      .deleteGridData(this.selectedRecords.map((x: any) => x[this.recordKey]))
      .subscribe(res => {
        if (!res.isError && res.result) {
          this.notifyService.notifySuccess(
            'Success',
            'Remove Successfully Completed.'
          );
          this.savedEvent.emit();
        } else {
          this.errorEvent.emit();
        }
      });
  }
}

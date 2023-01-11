import { Component } from '@angular/core';
import { catchError } from 'rxjs';
import { NotifyService } from 'src/app/core/utils/notify.service';
import { GridActionDirective } from '../../directives/grid-action.directive';
import { RemoveActionService } from '../../remove-services/remove-action.service';

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
      .pipe(
        catchError(err => {
          this.errorEvent.emit();
          return this.notifyService.notifyErrorInPipe(err, false);
        })
      )
      .subscribe(res => {
        if (res) {
          this.notifyService.notifySuccess('Success', 'Remove Success');
          this.savedEvent.emit();
        }
      });
  }

  onCancel(): void {
    console.log('cancel');
  }
}

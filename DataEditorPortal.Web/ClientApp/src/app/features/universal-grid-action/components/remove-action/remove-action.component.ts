import { Component, OnInit } from '@angular/core';
import { NotifyService, SystemLogService, UserService } from 'src/app/shared';
import { GridActionDirective } from '../../directives/grid-action.directive';
import { UniversalGridService } from '../../services/universal-grid.service';

@Component({
  selector: 'app-remove-action',
  templateUrl: './remove-action.component.html',
  styleUrls: ['./remove-action.component.scss']
})
export class RemoveActionComponent
  extends GridActionDirective
  implements OnInit
{
  constructor(
    private gridService: UniversalGridService,
    private notifyService: NotifyService,
    private systemLogService: SystemLogService,
    private userService: UserService
  ) {
    super();
  }
  ngOnInit(): void {
    this.loadedEvent.emit();
  }

  onSave(): void {
    this.systemLogService.addSiteVisitLog({
      action: 'Remove',
      section: this.userService.routerName,
      params: JSON.stringify(this.selectedRecords)
    });
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

import { Component } from '@angular/core';
import { SystemLogData } from 'src/app/shared';
import { SystemLogService } from 'src/app/shared/services/system-log.service';

@Component({
  selector: 'app-system-log-dialog',
  templateUrl: './system-log-dialog.component.html',
  styleUrls: ['./system-log-dialog.component.scss']
})
export class SystemLogDialogComponent {
  public visible = false;
  public viewData: any = {};
  public loading = true;
  constructor(private systemLogService: SystemLogService) {}

  show(row: SystemLogData) {
    this.systemLogService.getRowData(row.ID).subscribe(res => {
      if (!res.isError) {
        const { result } = res;
        this.viewData = {
          'Event time': result?.eventTime,
          'Category ': result?.category,
          'Event Section': result?.eventSection,
          'Event Name': result?.eventName,
          'User Name ': result?.username,
          'Details ': result?.details,
          'Params ': result?.params,
          'Result ': result?.result
        };
        this.viewData = Object.keys(this.viewData).map(key => {
          return {
            name: key,
            value: this.viewData[key]
          };
        });
        this.loading = false;
      }
    });

    this.visible = true;
  }

  cancel() {
    this.visible = false;
  }
}

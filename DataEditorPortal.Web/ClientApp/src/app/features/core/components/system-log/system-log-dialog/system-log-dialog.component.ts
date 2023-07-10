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
      if (res.code === 200) {
        const { data } = res;
        this.viewData = {
          'Event time': data?.eventTime,
          'Category ': data?.category,
          'Event Section': data?.eventSection,
          'Event Name': data?.eventName,
          'User Name ': data?.username,
          'Details ': data?.details,
          'Params ': data?.params,
          'Result ': data?.result
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

import { Component } from '@angular/core';
import { GridProp } from 'src/app/shared/models/system-log';
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

  show(row: GridProp) {
    this.systemLogService.getRowData(row.id).subscribe(res => {
      if (res) {
        this.viewData = res;
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

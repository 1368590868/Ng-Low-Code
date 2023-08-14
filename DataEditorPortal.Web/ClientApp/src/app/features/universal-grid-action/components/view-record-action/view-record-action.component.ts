import { Component, OnInit } from '@angular/core';
import { SystemLogService } from 'src/app/shared';
import { GridActionDirective } from '../../directives/grid-action.directive';
import { UniversalGridService } from '../../services/universal-grid.service';

export interface ViewColumn {
  name?: string;
  value?: string;
  key: string;
  type: string;
  format?: string;
  template?: string;
  filterType: string;
}

@Component({
  selector: 'app-view-record-action',
  templateUrl: './view-record-action.component.html',
  styleUrls: ['./view-record-action.component.scss']
})
export class ViewRecordActionComponent
  extends GridActionDirective
  implements OnInit
{
  viewData: ViewColumn[];
  loading = true;
  formatters?: any;

  constructor(
    private universalGridService: UniversalGridService,
    private systemLogService: SystemLogService
  ) {
    super();
    this.viewData = [];
  }

  ngOnInit(): void {
    this.systemLogService.addSiteVisitLog({
      action: 'View Detail',
      section: this.gridName,
      params: JSON.stringify(this.selectedRecords[0])
    });
    this.universalGridService.getTableColumns(this.gridName).subscribe(res => {
      if (this.selectedRecords[0] !== undefined) {
        const key = Object.keys(this.selectedRecords[0])
          .filter(key => key != 'RowNumber')
          .map(key => {
            const field = res.find(x => x.field === key);
            return {
              key: field?.field,
              name: field?.header,
              value: this.selectedRecords[0][key],
              type: field?.type,
              format: field?.format,
              template: field?.template,
              filterType: field?.filterType
            };
          })
          .filter(x => x.name !== undefined);
        // sort by res
        const result = res.map(x => {
          return {
            key: x.field,
            name: x.header,
            value: key.find(y => y.name === x.header)?.value,
            type: x.type,
            format: x.format,
            template: x.template,
            filterType: x.filterType
          };
        });
        this.viewData = result;
        this.loading = false;
        this.loadedEvent.emit();
      }
    });
  }
}

import { Component, OnInit } from '@angular/core';
import { GridColumn } from 'src/app/features/portal-management/models/portal-item';
import { DataFormatService } from 'src/app/features/universal-grid/services/data-format.service';
import { SystemLogService } from 'src/app/shared';
import { evalExpression, evalStringExpression } from 'src/app/shared/utils';
import { GridActionDirective } from '../../directives/grid-action.directive';
import { UniversalGridService } from '../../services/universal-grid.service';

export interface ViewColumn extends GridColumn {
  name?: string;
  value?: string;
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
    private dataFormatService: DataFormatService,
    private systemLogService: SystemLogService
  ) {
    super();
    this.viewData = [];
    this.formatters = this.dataFormatService.getFormatters();
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

  calcCustomTemplate(data: any, template: string) {
    const expression = evalStringExpression(template, ['row', 'pipes']);
    return evalExpression(expression, data, [data, this.formatters]);
  }
}

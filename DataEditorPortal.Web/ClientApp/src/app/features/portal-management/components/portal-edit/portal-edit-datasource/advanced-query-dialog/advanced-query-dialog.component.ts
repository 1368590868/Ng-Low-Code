import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormControl } from '@angular/forms';
import { DataSourceTableColumn } from 'src/app/features/portal-management/models/portal-item';
import { PortalItemService } from 'src/app/features/portal-management/services/portal-item.service';
import { NotifyService } from 'src/app/shared';

export interface AdvancedQueryModel {
  queryText: string;
  columns: DataSourceTableColumn[];
}

@Component({
  selector: 'app-advanced-query-dialog',
  templateUrl: './advanced-query-dialog.component.html',
  styleUrls: ['./advanced-query-dialog.component.scss']
})
export class AdvancedQueryDialogComponent {
  @Input() connectionName = '';
  @Input() queryText?: string;
  @Output() queryChange = new EventEmitter<AdvancedQueryModel>();

  formControlQuery: FormControl = new FormControl();

  loading = false;
  advanceDialogVisible = false;
  helperMessage =
    'Enter the query text for fetching the data. <br />' +
    'E.g. <br /><br />' +
    'SELECT * FROM DEMO_TABLE <br />WHERE ##WHERE## AND ##SEARCHES## AND ##FILTERS## <br />ORDER BY ##ORDERBY##';

  constructor(private portalItemService: PortalItemService, private notifyService: NotifyService) {}

  showAdvanceDialog() {
    this.advanceDialogVisible = true;
    this.formControlQuery.setValue(this.queryText);
    setTimeout(() => {
      this.formControlQuery.markAsPristine();
    }, 100);
  }

  onAdvanceDialogOk() {
    if (this.formControlQuery.valid) {
      if (this.formControlQuery.value != this.queryText) {
        // validate if the query can be run against database succesfully
        this.loading = true;
        this.portalItemService
          .getDataSourceTableColumnsByQuery(this.connectionName, this.formControlQuery.value)
          .subscribe(res => {
            if (res.code === 200) {
              this.queryChange.emit({
                queryText: this.formControlQuery.value,
                columns: res.data || []
              });
              this.advanceDialogVisible = false;
            }
            this.loading = false;
          });
      } else {
        this.advanceDialogVisible = false;
      }
    } else {
      this.notifyService.notifyWarning('', 'Query text is required.');
      this.formControlQuery.markAsDirty();
    }
  }

  onAdvanceDialogCancel() {
    this.advanceDialogVisible = false;
  }
}

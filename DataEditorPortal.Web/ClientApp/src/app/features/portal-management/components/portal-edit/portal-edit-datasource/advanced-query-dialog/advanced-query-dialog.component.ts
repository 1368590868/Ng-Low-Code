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
  @Input() connectionId = '';
  @Input() queryText?: string;
  @Output() queryChange = new EventEmitter<AdvancedQueryModel>();

  formControlQuery: FormControl = new FormControl();

  loading = false;
  advanceDialogVisible = false;
  helperMessage =
    '-- Enter the query text for fetching the data. \r\n\r\n' +
    '-- E.g. \r\n' +
    '-- SELECT * FROM DEMOTABLES WHERE ##WHERE## AND ##SEARCHES## AND ##FILTERS## ORDER BY ##ORDERBY##';

  constructor(
    private portalItemService: PortalItemService,
    private notifyService: NotifyService
  ) {}

  onMonacoEditorInit(editor: any) {
    editor.onMouseDown(() => {
      if (this.formControlQuery.value === this.helperMessage) {
        this.formControlQuery.reset();
        setTimeout(() => {
          this.formControlQuery.markAsPristine();
        }, 100);
      }
    });
    editor.onDidBlurEditorText(() => {
      if (!this.formControlQuery.value) {
        this.formControlQuery.setValue(this.helperMessage);
      }
    });
  }

  showAdvanceDialog() {
    this.advanceDialogVisible = true;
    this.formControlQuery.reset();
    if (this.queryText) this.formControlQuery.setValue(this.queryText);
    else this.formControlQuery.setValue(this.helperMessage);
  }

  onAdvanceDialogOk() {
    if (
      this.formControlQuery.valid &&
      this.formControlQuery.value != this.helperMessage
    ) {
      if (this.formControlQuery.value != this.queryText) {
        // validate if the query can be run against database succesfully
        this.loading = true;
        this.portalItemService
          .getDataSourceTableColumnsByQuery(
            this.connectionId,
            this.formControlQuery.value
          )
          .subscribe(res => {
            if (!res.isError) {
              this.queryChange.emit({
                queryText: this.formControlQuery.value,
                columns: res.result || []
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

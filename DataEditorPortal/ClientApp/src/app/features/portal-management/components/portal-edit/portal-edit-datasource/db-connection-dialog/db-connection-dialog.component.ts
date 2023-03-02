import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormControl } from '@angular/forms';
import { PortalItemService } from 'src/app/features/portal-management/services/portal-item.service';
import { NotifyService } from 'src/app/shared';
import { AdvancedQueryModel } from '../advanced-query-dialog/advanced-query-dialog.component';

@Component({
  selector: 'app-db-connection-dialog',
  templateUrl: './db-connection-dialog.component.html',
  styleUrls: ['./db-connection-dialog.component.scss']
})
export class DbConnectionDialogComponent {
  @Input() connectionString?: string =
    'Data Source=192.168.1.241;Initial Catalog=DataEditorPortal;Uid=sa;Pwd=123456;MultipleActiveResultSets=true;Enlist=true;Pooling=true;Max Pool Size=1024;Min Pool Size=0;';
  @Output() connectionChange = new EventEmitter<AdvancedQueryModel>();

  formControlDisplayOnly: FormControl = new FormControl();
  formControlConnection: FormControl = new FormControl();
  visible = false;

  helperMessage = '';

  constructor(
    private portalItemService: PortalItemService,
    private notifyService: NotifyService
  ) {}

  onMonacoEditorInit(editor: any) {
    editor.onMouseDown(() => {
      if (this.formControlConnection.value === this.helperMessage) {
        this.formControlConnection.reset();
        setTimeout(() => {
          this.formControlConnection.markAsPristine();
        }, 100);
      }
    });
    editor.onDidBlurEditorText(() => {
      if (!this.formControlConnection.value) {
        this.formControlConnection.setValue(this.helperMessage);
      }
    });
  }

  showDialog() {
    this.visible = true;
    this.formControlConnection.reset();
    if (this.connectionString)
      this.formControlConnection.setValue(this.connectionString);
    else this.formControlConnection.setValue(this.helperMessage);
  }

  onDialogOk() {
    if (
      this.formControlConnection.valid &&
      this.formControlConnection.value != this.helperMessage
    ) {
      if (this.formControlConnection.value != this.connectionString) {
        // validate if the query can be run against database succesfully
        // this.portalItemService
        //   .getDataSourceTableColumnsByQuery(this.formControlConnection.value)
        //   .subscribe(res => {
        //     if (!res.isError) {
        //       this.queryChange.emit({
        //         queryText: this.formControlQuery.value,
        //         columns: res.result || []
        //       });
        //       this.advanceDialogVisible = false;
        //     }
        //   });
      } else {
        this.visible = false;
      }
    } else {
      this.notifyService.notifyWarning('', 'Query text is required.');
      this.formControlConnection.markAsDirty();
    }
  }

  onCancel() {
    this.visible = false;
  }
}

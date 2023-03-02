import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormControl } from '@angular/forms';
import { PortalItemService } from 'src/app/features/portal-management/services/portal-item.service';
import { NotifyService } from 'src/app/shared';

@Component({
  selector: 'app-db-connection-dialog',
  templateUrl: './db-connection-dialog.component.html',
  styleUrls: ['./db-connection-dialog.component.scss']
})
export class DbConnectionDialogComponent {
  @Input() connectionString?: string;
  @Output() connectionChange = new EventEmitter<{
    label: string;
    value: string;
  }>();

  formControlConnection: FormControl = new FormControl();
  formControlName: FormControl = new FormControl();

  visible = false;
  loading = false;

  helperMessage =
    'Please enter the connection string to connect to your server.\r\n\r\n' +
    'E.g.\r\n' +
    'Data Source=.; Initial Catalog=DemoDb; Uid=xxxxxx; Pwd=yyyyyy;';

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
    setTimeout(() => {
      this.formControlConnection.markAsPristine();
    });
  }

  showDialog() {
    this.visible = true;
    this.formControlConnection.reset();
    this.formControlName.reset();
    if (this.connectionString)
      this.formControlConnection.setValue(this.connectionString);
    else this.formControlConnection.setValue(this.helperMessage);
  }

  onDialogOk() {
    if (!this.formControlName.valid) {
      this.formControlName.markAsDirty();
      return;
    }

    if (
      this.formControlConnection.valid &&
      this.formControlConnection.value != this.helperMessage
    ) {
      if (this.formControlConnection.value != this.connectionString) {
        this.loading = true;
        this.portalItemService
          .createDataSourceConnection({
            name: this.formControlName.value,
            connectionString: this.formControlConnection.value
          })
          .subscribe(res => {
            if (!res.isError) {
              this.connectionChange.emit({
                label: this.formControlName.value,
                value: res.result || ''
              });
              this.visible = false;
            }
            this.loading = false;
          });
      } else {
        this.visible = false;
      }
    } else {
      this.notifyService.notifyWarning('', 'Connection string is required.');
      this.formControlConnection.markAsDirty();
    }
  }

  onCancel() {
    this.visible = false;
  }
}

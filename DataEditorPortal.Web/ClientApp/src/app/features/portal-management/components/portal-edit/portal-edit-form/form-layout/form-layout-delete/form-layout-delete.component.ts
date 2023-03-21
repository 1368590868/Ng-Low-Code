import { Component, Inject, Input } from '@angular/core';
import { FormControl } from '@angular/forms';
import { GridFormConfig } from 'src/app/features/portal-management/models/portal-item';
import { GridActionConfig } from 'src/app/features/universal-grid-action';
import { NotifyService } from 'src/app/shared';

@Component({
  selector: 'app-form-layout-delete',
  templateUrl: './form-layout-delete.component.html',
  styleUrls: ['./form-layout-delete.component.scss']
})
export class FormLayoutDeleteComponent {
  helperMessage =
    '-- E.g. \r\n\r\n' + '-- DELETE DEMO_TABLE WHERE ID IN ##ID##';

  _formConfig: GridFormConfig = {};
  @Input() type!: string;
  @Input()
  set config(val: GridFormConfig) {
    Object.assign(this._formConfig, val);
    this.showQuery = !!this._formConfig.queryText;

    if (!this._formConfig.queryText) {
      this.formControlQueryText.setValue(this.helperMessage);
    } else {
      this.formControlQueryText.setValue(this._formConfig.queryText);
    }

    if (this._formConfig.OnValidate) {
      this.formControlOnValidateConfig.setValue(this._formConfig.OnValidate);
    }
    if (this._formConfig.AfterDelete) {
      this.formControlAfterConfig.setValue(this._formConfig.AfterDelete);
    }
  }

  @Input() queryTextRequired = false;
  customActions: { label: string | undefined; value: string }[] = [];

  showQuery = false;
  formControlQueryText = new FormControl();
  formControlOnValidateConfig = new FormControl();
  formControlAfterConfig = new FormControl();

  constructor(
    private notifyService: NotifyService,
    @Inject('GRID_ACTION_CONFIG')
    public customActionsConfig: GridActionConfig[]
  ) {
    this.customActions = customActionsConfig
      .filter(x => x.isCustom)
      .map(x => {
        return { label: x.label, value: x.name };
      });

    this.formControlQueryText.valueChanges.subscribe(
      val => (this._formConfig.queryText = val)
    );
  }

  onMonacoEditorInit(editor: any) {
    editor.onMouseDown(() => {
      if (this.formControlQueryText.value === this.helperMessage) {
        this.formControlQueryText.reset();
        setTimeout(() => {
          this.formControlQueryText.markAsPristine();
        }, 100);
      }
    });
    editor.onDidBlurEditorText(() => {
      if (!this.formControlQueryText.value) {
        this.formControlQueryText.setValue(this.helperMessage);
      }
    });
  }

  validate() {
    if (this._formConfig.useCustomForm) {
      if (!this._formConfig.customFormName) {
        this.notifyService.notifyWarning(
          'Warning',
          `Please select one Custom Form for Deleting.`
        );
        return false;
      }
    } else {
      if (this.type === 'Delete') {
        if (
          this.queryTextRequired &&
          (!this._formConfig.queryText ||
            this._formConfig.queryText === this.helperMessage)
        ) {
          this.notifyService.notifyWarning(
            'Warning',
            `Query for Deleting is required if your data source is configured as SQL statements.`
          );
          return false;
        }
      }
    }
    return true;
  }

  getValue(): GridFormConfig {
    const data = JSON.parse(JSON.stringify(this._formConfig)) as GridFormConfig;
    if (data.queryText === this.helperMessage) data.queryText = undefined;
    data.OnValidate = this.formControlOnValidateConfig.value;
    data.AfterDelete = this.formControlAfterConfig.value;

    return data;
  }
}

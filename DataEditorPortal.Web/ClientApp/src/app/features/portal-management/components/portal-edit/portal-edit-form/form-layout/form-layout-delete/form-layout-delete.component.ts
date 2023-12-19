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
    'E.g. <br /></br />' +
    'DELETE DEMO_TABLE WHERE ID IN ##ID##<br /><br />' +
    'Note: Please always use IN operator to support batch delete.';

  _formConfig: GridFormConfig = {
    enabled: false
  };
  showOnValidate = false;
  @Input() type!: string;
  @Input()
  set config(val: GridFormConfig) {
    Object.assign(this._formConfig, val);
    this.showQuery = !!this._formConfig.queryText;

    this.formControlQueryText.setValue(this._formConfig.queryText);

    if (this._formConfig.onValidate) {
      this.formControlOnValidateConfig.setValue(this._formConfig.onValidate);
    }
    if (this._formConfig.afterSaved) {
      this.formControlOnAfterSavedConfig.setValue(this._formConfig.afterSaved);
    }
  }

  @Input() queryTextRequired = false;
  customActions: { label: string | undefined; value: string }[] = [];

  showQuery = false;
  formControlQueryText = new FormControl();
  formControlOnValidateConfig = new FormControl();
  formControlOnAfterSavedConfig = new FormControl();

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

    this.formControlQueryText.valueChanges.subscribe(val => (this._formConfig.queryText = val));
  }

  validate() {
    if (!this._formConfig.enabled) return true;
    if (this._formConfig.useCustomForm) {
      if (!this._formConfig.customFormName) {
        this.notifyService.notifyWarning('Warning', `Please select one Custom Form for Deleting.`);
        return false;
      }
    } else {
      if (this.type === 'Delete') {
        if (this.queryTextRequired && !this._formConfig.queryText) {
          this.notifyService.notifyWarning(
            'Warning',
            `Query for Deleting is required if your data source is configured as SQL statements.`
          );
          return false;
        }
      }
    }
    if (this.formControlOnValidateConfig.value?.eventType && !this.formControlOnValidateConfig.value.script) {
      this.notifyService.notifyWarning('Warning', 'Please complete On Validate settings for Deleting.');
      return false;
    }
    if (this.formControlOnAfterSavedConfig.value?.eventType && !this.formControlOnAfterSavedConfig.value.script) {
      this.notifyService.notifyWarning('Warning', 'Please complete On After Saved settings for Deleting.');
      return false;
    }

    return true;
  }

  getValue(): GridFormConfig {
    const data = JSON.parse(JSON.stringify(this._formConfig)) as GridFormConfig;

    data.onValidate = !this.formControlOnValidateConfig.value?.eventType
      ? undefined
      : this.formControlOnValidateConfig.value;
    data.afterSaved = !this.formControlOnAfterSavedConfig.value?.eventType
      ? undefined
      : this.formControlOnAfterSavedConfig.value;

    return data;
  }
}

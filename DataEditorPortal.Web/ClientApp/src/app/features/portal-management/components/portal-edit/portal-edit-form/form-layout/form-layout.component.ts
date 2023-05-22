import {
  Component,
  Inject,
  Input,
  ViewChild,
  ViewChildren
} from '@angular/core';
import { FormControl } from '@angular/forms';
import { PickList } from 'primeng/picklist';
import {
  GridFormConfig,
  DataSourceTableColumn,
  GridFormField
} from 'src/app/features/portal-management/models/portal-item';
import { GridActionConfig } from 'src/app/features/universal-grid-action';
import { NotifyService } from 'src/app/shared';
import { FormDesignerViewComponent } from '../../../form-designer/form-designer-view.component';

@Component({
  selector: 'app-form-layout',
  templateUrl: './form-layout.component.html',
  styleUrls: ['./form-layout.component.scss']
})
export class FormLayoutComponent {
  _type: 'ADD' | 'UPDATE' = 'ADD';
  @Input()
  set type(val: 'ADD' | 'UPDATE') {
    this._type = val;
    if (val === 'UPDATE') {
      this.helperMessage =
        '-- E.g. \r\n\r\n' +
        '-- UPDATE DEMO_TABLE SET NAME = ##NAME##, FIRS_TNAME = ##FIRST_NAME##, TOTAL = ##TOTAL## WHERE ID = ##ID##';
    }
  }

  helperMessage =
    '-- E.g. \r\n\r\n' +
    '-- INSERT INTO DEMO_TABLE (ID, NAME, FIRST_NAME, TOTAL, CREATED_DATE) VALUES (NEWID(), ##NAME##, ##FIRST_NAME##, ##TOTAL##, GETDATE())';

  _formConfig: GridFormConfig = {
    sameAsAdd: true
  };
  @Input()
  set config(val: GridFormConfig) {
    Object.assign(this._formConfig, val);
    this.showQuery =
      !!this._formConfig.queryText &&
      this._formConfig.queryText != this.helperMessage;

    if (!this._formConfig.queryText) {
      this.formControlQueryText.setValue(this.helperMessage);
    } else {
      this.formControlQueryText.setValue(this._formConfig.queryText);
    }

    if (this._formConfig.onValidate) {
      this.formControlOnValidateConfig.setValue(this._formConfig.onValidate);
    }
    if (this._formConfig.afterSaved) {
      this.formControlOnAfterSavedConfig.setValue(this._formConfig.afterSaved);
    }

    if (val.formFields) {
      this.targetColumns = val.formFields.map<GridFormField>(x => {
        return {
          ...x,
          selected: true
        };
      });
      this.updateSourceColumns();
    }
  }

  _dbColumns: DataSourceTableColumn[] = [];
  @Input()
  set dbColumns(val: DataSourceTableColumn[]) {
    this._dbColumns = val;
    this.updateSourceColumns();
    this.mappingColumns = this._dbColumns;
  }

  @Input() queryTextRequired = false;

  sourceColumns: GridFormField[] = [];
  targetColumns: GridFormField[] = [];
  mappingColumns: DataSourceTableColumn[] = [];
  @ViewChild('pickList') pickList!: PickList;

  model: any = {};
  @ViewChildren(FormDesignerViewComponent)
  formDesignerViews!: FormDesignerViewComponent[];

  customActions: { label: string | undefined; value: string }[] = [];

  showQuery = false;
  showOnValidate = false;
  // showFetchQuery = false;
  formControlQueryText = new FormControl();
  formControlOnValidateConfig = new FormControl();
  formControlOnAfterSavedConfig = new FormControl();

  constructor(
    private notifyService: NotifyService,
    @Inject('GRID_ACTION_CONFIG')
    public customActionsConfig: GridActionConfig[],
    @Inject('FROM_DESIGNER_CONTROLS') private controls: any[]
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

  updateSourceColumns() {
    this.sourceColumns = this._dbColumns
      .filter(s => !this.targetColumns.find(t => t.key === s.columnName))
      .map<GridFormField>(x => {
        const result = this.controls.filter(c => c.filterType === x.filterType);
        return {
          key: x.columnName,
          type: result[0].value,
          defaultValue: result[0].value === 'checkbox' ? false : null,
          props: {
            label: x.columnName,
            required: !x.allowDBNull
            // placeholder: x.columnName
          },
          filterType: x.filterType,
          selected: false
        };
      });
  }

  onMoveToTarget({ items }: { items: GridFormField[] }) {
    items.forEach(item => {
      item.selected = true;
    });
  }

  onMoveToSource({ items }: { items: GridFormField[] }) {
    items.forEach(item => {
      item.selected = false;
    });
    if (items.find(x => x.key === this.model.key)) {
      this.model = {};
    }
  }

  onTargetSelect({ items }: { items: GridFormField[] }) {
    if (items.length === 1) {
      this.model = items[0];
    } else {
      this.model = {};
    }
  }

  configChange(column: GridFormField) {
    const ref = this.formDesignerViews.find(x => x.key === column.key);
    ref?.updateConfig(column);
  }

  validate() {
    if (this._formConfig.useCustomForm) {
      if (!this._formConfig.customFormName) {
        this.notifyService.notifyWarning(
          'Warning',
          `Please select one Custom Form for ${
            this._type === 'ADD' ? 'Adding' : 'Updating'
          }.`
        );
        return false;
      }
    } else {
      if (this._type === 'ADD') {
        if (!this.targetColumns || this.targetColumns.length === 0) {
          this.notifyService.notifyWarning(
            'Warning',
            'Please select some fields for Adding Form.'
          );
          return false;
        }
        if (
          this.queryTextRequired &&
          (!this._formConfig.queryText ||
            this._formConfig.queryText === this.helperMessage)
        ) {
          this.notifyService.notifyWarning(
            'Warning',
            'Query for Adding is required if your data source is configured as SQL statements.'
          );
          return false;
        }
        if (
          this.formControlOnValidateConfig.value?.eventType &&
          !this.formControlOnValidateConfig.value.script
        ) {
          this.notifyService.notifyWarning(
            'Warning',
            'Please complete On Validate settings for Adding.'
          );
          return false;
        }
        if (
          this.formControlOnAfterSavedConfig.value?.eventType &&
          !this.formControlOnAfterSavedConfig.value.script
        ) {
          this.notifyService.notifyWarning(
            'Warning',
            'Please complete On After Saved settings for Adding.'
          );
          return false;
        }
      }
      if (this._type === 'UPDATE') {
        if (
          !this._formConfig.sameAsAdd &&
          (!this.targetColumns || this.targetColumns.length === 0)
        ) {
          this.notifyService.notifyWarning(
            'Warning',
            'Please select some fields for Updating Form.'
          );
          return false;
        }
        if (
          this.queryTextRequired &&
          (!this._formConfig.queryText ||
            this._formConfig.queryText === this.helperMessage)
        ) {
          this.notifyService.notifyWarning(
            'Warning',
            'Query for Updating is required if your data source is configured as SQL statements.'
          );
          return false;
        }
        if (
          this.formControlOnValidateConfig.value?.eventType &&
          !this.formControlOnValidateConfig.value.script
        ) {
          this.notifyService.notifyWarning(
            'Warning',
            'Please complete On Validate settings for Updating.'
          );
          return false;
        }
        if (
          this.formControlOnAfterSavedConfig.value?.eventType &&
          !this.formControlOnAfterSavedConfig.value.script
        ) {
          this.notifyService.notifyWarning(
            'Warning',
            'Please complete On After Saved settings for Updating.'
          );
          return false;
        }
      }
    }

    return true;
  }

  getValue(): GridFormConfig {
    const data = JSON.parse(JSON.stringify(this._formConfig)) as GridFormConfig;
    if (!data.useCustomForm) data.formFields = this.targetColumns;
    if (data.queryText === this.helperMessage) data.queryText = undefined;

    data.onValidate = !this.formControlOnValidateConfig.value?.eventType
      ? undefined
      : this.formControlOnValidateConfig.value;
    data.afterSaved = !this.formControlOnAfterSavedConfig.value?.eventType
      ? undefined
      : this.formControlOnAfterSavedConfig.value;

    return data;
  }

  isRequired(field: GridFormField) {
    const dbCol = this._dbColumns.find(x => x.columnName == field.key);
    if (dbCol) {
      return !dbCol.allowDBNull && !(dbCol.isAutoIncrement || dbCol.isIdentity);
    }
    return true;
  }
}

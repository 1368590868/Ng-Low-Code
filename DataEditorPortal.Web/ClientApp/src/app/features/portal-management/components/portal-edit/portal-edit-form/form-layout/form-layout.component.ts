import {
  Component,
  Inject,
  Input,
  ViewChild,
  ViewChildren
} from '@angular/core';
import { FormControl } from '@angular/forms';
import { MenuItem } from 'primeng/api';
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
        'E.g. <br /><br />' +
        'UPDATE DEMO_TABLE <br />SET NAME = ##NAME##, FIRS_TNAME = ##FIRST_NAME##, TOTAL = ##TOTAL## WHERE ID = ##ID##';
    }
  }

  helperMessage =
    'E.g. <br /><br />' +
    'INSERT INTO DEMO_TABLE (ID, NAME, FIRST_NAME, TOTAL, CREATED_DATE) <br />VALUES (NEWID(), ##NAME##, ##FIRST_NAME##, ##TOTAL##, GETDATE())';

  _formConfig: GridFormConfig = {
    useAddingFormLayout: true
  };
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
  }

  @Input() queryTextRequired = false;

  sourceColumns: GridFormField[] = [];
  targetColumns: GridFormField[] = [];
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

  addCustomControlModel: MenuItem[] = [
    {
      label: 'Location Editor',
      icon: 'pi pi-fw pi-bars',
      command: () => {
        this.onAddCustomControl('locationField');
      }
    }
  ];

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
        if (this.queryTextRequired && !this._formConfig.queryText) {
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
          !this._formConfig.useAddingFormLayout &&
          (!this.targetColumns || this.targetColumns.length === 0)
        ) {
          this.notifyService.notifyWarning(
            'Warning',
            'Please select some fields for Updating Form.'
          );
          return false;
        }
        if (this.queryTextRequired && !this._formConfig.queryText) {
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

  onAddCustomControl(filterType: string) {
    let index = 1;
    for (index = 1; index <= 100; index++) {
      if (!this.targetColumns.find(x => x.key === `CUSTOM_CONTROL_${index}`))
        break;
    }
    const key = `CUSTOM_CONTROL_${index}`;
    const result = this.controls.filter(c => c.filterType === filterType);
    const model: any = {
      key: key,
      type: result[0].value,
      props: {
        label: key
      },
      filterType: filterType,
      selected: true
    };

    if (filterType === 'locationField') {
      model.props['fromLabel'] = 'From';
      model.props['fromMeasureLabel'] = 'From Measure';
      model.props['toLabel'] = 'To';
      model.props['toMeasureLabel'] = 'To Measure';
      model.props['locationType'] = 2;
    }

    this.targetColumns = [model, ...this.targetColumns];
  }

  onRemoveCustomControl(event: MouseEvent, field: GridFormField) {
    event.stopPropagation();
    const index = this.targetColumns.findIndex(x => x.key === field.key);
    if (index >= 0) {
      this.targetColumns.splice(index, 1);
      if (field.key === this.model.key) {
        this.model = {};
      }
    }
  }
}

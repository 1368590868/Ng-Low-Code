import {
  Component,
  Inject,
  Input,
  ViewChild,
  ViewChildren
} from '@angular/core';
import { PickList } from 'primeng/picklist';
import {
  GridFormConfig,
  DataSourceTableColumn,
  GridFormField
} from 'src/app/features/portal-management/models/portal-item';
import { GridActionConfig } from 'src/app/features/universal-grid-action';
import { NotifyService } from 'src/app/shared';
import { FormDesignerViewComponent } from '../../form-designer/form-designer-view.component';

@Component({
  selector: 'app-form-layout',
  templateUrl: './form-layout.component.html',
  styleUrls: ['./form-layout.component.scss']
})
export class FormLayoutComponent {
  @Input()
  type: 'ADD' | 'UPDATE' = 'ADD';

  _formConfig: GridFormConfig = {
    sameAsAdd: true
  };
  @Input()
  set config(val: GridFormConfig) {
    Object.assign(this._formConfig, val);
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

  sourceColumns: GridFormField[] = [];
  targetColumns: GridFormField[] = [];
  @ViewChild('pickList') pickList!: PickList;

  model: any = {};
  allSelectedFields: { key: string; type: string }[] = [];
  @ViewChildren(FormDesignerViewComponent)
  formDesignerViews!: FormDesignerViewComponent[];

  customActions: { label: string | undefined; value: string }[] = [];

  showQuery = false;
  showFetchQuery = false;

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
  }

  updateSourceColumns() {
    this.sourceColumns = this._dbColumns
      .filter(s => !this.targetColumns.find(t => t.key === s.columnName))
      .map<GridFormField>(x => {
        const result = this.controls.filter(c => c.filterType === x.filterType);
        return {
          key: x.columnName,
          type: result[0].value,
          props: {
            label: x.columnName,
            required: !x.allowDBNull
            // placeholder: x.columnName
          },
          filterType: x.filterType
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
      this.allSelectedFields = this.targetColumns.map(x => {
        return { key: x.key, type: x.type };
      });
    } else {
      this.model = {};
    }
  }

  configChange(column: GridFormField) {
    const ref = this.formDesignerViews.find(x => x.key === column.key);
    ref?.updateConfig(column);
  }

  validate() {
    if (
      this.type === 'ADD' ||
      (this.type === 'UPDATE' && !this._formConfig.sameAsAdd)
    ) {
      if (
        !this._formConfig.useCustomForm &&
        (!this.targetColumns || this.targetColumns.length === 0)
      ) {
        return false;
      }
    }

    return true;
  }

  getValue(): GridFormConfig {
    const data = JSON.parse(JSON.stringify(this._formConfig)) as GridFormConfig;
    if (!data.useCustomForm) data.formFields = this.targetColumns;
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

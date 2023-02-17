import {
  ChangeDetectorRef,
  Component,
  Inject,
  OnInit,
  ViewChild,
  ViewChildren
} from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { PickList } from 'primeng/picklist';
import { forkJoin, tap } from 'rxjs';
import { NotifyService } from 'src/app/shared';
import { GridActionConfig } from 'src/app/features/universal-grid-action';
import {
  GridFormField,
  GridFormConfig,
  DataSourceTableColumn
} from '../../../models/portal-item';
import { PortalItemService } from '../../../services/portal-item.service';
import { FormDesignerViewComponent } from '../form-designer/form-designer-view.component';

@Component({
  selector: 'app-portal-edit-form',
  templateUrl: './portal-edit-form.component.html',
  styleUrls: ['./portal-edit-form.component.scss']
})
export class PortalEditFormComponent implements OnInit {
  isLoading = true;
  isSaving = false;
  isSavingAndNext = false;
  isSavingAndExit = false;

  formConfig: GridFormConfig = {
    allowEdit: true,
    allowDelete: true
  };
  dbColumns: DataSourceTableColumn[] = [];
  sourceColumns: GridFormField[] = [];
  targetColumns: GridFormField[] = [];
  @ViewChild('pickList') pickList!: PickList;

  model: any = {};
  allSelectedFields: { key: string; type: string }[] = [];
  @ViewChildren(FormDesignerViewComponent)
  formDesignerViews!: FormDesignerViewComponent[];

  customActions: { label: string | undefined; value: string }[] = [];

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private changeDetectorRef: ChangeDetectorRef,
    private portalItemService: PortalItemService,
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

  ngOnInit(): void {
    if (this.portalItemService.currentPortalItemId) {
      forkJoin([
        this.portalItemService.getGridFormConfig(),
        this.portalItemService.getDataSourceTableColumnsByPortalId()
      ]).subscribe(res => {
        this.isLoading = false;

        this.formConfig = res[0];
        if (res[0].formFields) {
          this.targetColumns = res[0].formFields.map<GridFormField>(x => {
            return {
              ...x,
              selected: true
            };
          });
        }
        this.dbColumns = res[1];
        this.sourceColumns = res[1]
          .filter(s => !this.targetColumns.find(t => t.key === s.columnName))
          .map<GridFormField>(x => {
            const result = this.controls.filter(
              c => c.filterType === x.filterType
            );
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
      });

      this.portalItemService.saveCurrentStep('form');
    }
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

  valid() {
    if (this.formConfig.allowEdit) {
      if (
        !this.formConfig.useCustomForm &&
        (!this.targetColumns || this.targetColumns.length === 0)
      ) {
        this.notifyService.notifyWarning(
          'Warning',
          'Please select at least one field.'
        );
        return false;
      }
    }
    return true;
  }

  saveGridFormConfig() {
    this.isSaving = true;
    const data = JSON.parse(JSON.stringify(this.formConfig)) as GridFormConfig;
    if (data.allowEdit && !data.useCustomForm)
      data.formFields = this.targetColumns;

    if (this.portalItemService.currentPortalItemId) {
      this.portalItemService
        .saveGridFormConfig(data)
        .pipe(
          tap(res => {
            if (res && !res.isError) {
              this.saveSucess();
            }
            this.isSaving = false;
            this.isSavingAndExit = false;
            this.isSavingAndNext = false;
          })
        )
        .subscribe();
    }
  }

  saveSucess() {
    if (this.isSavingAndNext && this.portalItemService.currentPortalItemId) {
      this.portalItemService.saveCurrentStep('basic');
      this.portalItemService
        .publish(this.portalItemService.currentPortalItemId)
        .subscribe(res => {
          if (!res.isError) {
            this.notifyService.notifySuccess(
              'Success',
              'Save & Publish Successfully Completed.'
            );

            this.router.navigate(['../../../list'], {
              relativeTo: this.activatedRoute
            });
          } else {
            this.isSavingAndNext = false;
            this.isSaving = false;
          }
        });
    }
    if (this.isSavingAndExit) {
      this.notifyService.notifySuccess(
        'Success',
        'Save Draft Successfully Completed.'
      );
      this.router.navigate(['../../../list'], {
        relativeTo: this.activatedRoute
      });
    }
  }

  onSaveAndNext() {
    if (!this.valid()) return;
    this.isSavingAndNext = true;
    this.saveGridFormConfig();
  }

  onSaveAndExit() {
    if (!this.valid()) return;
    this.isSavingAndExit = true;
    this.saveGridFormConfig();
  }

  onBack() {
    this.router.navigate(['../search'], {
      relativeTo: this.activatedRoute
    });
  }

  isRequired(field: GridFormField) {
    const dbCol = this.dbColumns.find(x => x.columnName == field.key);
    if (dbCol) {
      return !dbCol.allowDBNull && !(dbCol.isAutoIncrement || dbCol.isIdentity);
    }
    return true;
  }
}

import {
  ChangeDetectorRef,
  Component,
  Inject,
  OnInit,
  ViewChild
} from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { FormlyFormOptions, FormlyFieldConfig } from '@ngx-formly/core';
import { PickList } from 'primeng/picklist';
import { distinctUntilChanged, forkJoin, startWith, tap } from 'rxjs';
import { NotifyService } from 'src/app/app.module';
import { GridActionConfig } from 'src/app/features/universal-grid-action/universal-grid-action.module';
import { GridFormField, GridFormConfig } from '../../../models/portal-item';
import { PortalItemService } from '../../../services/portal-item.service';

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
  sourceColumns: GridFormField[] = [];
  targetColumns: GridFormField[] = [];
  @ViewChild('pickList') pickList!: PickList;

  controls: { label: string; value: string; filterType: string }[] = [
    {
      label: 'Checkbox',
      value: 'checkbox',
      filterType: 'boolean'
    },
    {
      label: 'Checkbox List',
      value: 'checkboxList',
      filterType: 'array'
    },
    {
      label: 'Date',
      value: 'datepicker',
      filterType: 'date'
    },
    {
      label: 'Dropdown',
      value: 'select',
      filterType: 'text'
    },
    {
      label: 'Multiple Dropdown',
      value: 'multiSelect',
      filterType: 'array'
    },
    {
      label: 'Radio List',
      value: 'radio',
      filterType: 'text'
    },
    {
      label: 'Textbox',
      value: 'input',
      filterType: 'text'
    },
    {
      label: 'Textarea',
      value: 'textarea',
      filterType: 'text'
    },
    {
      label: 'Textbox',
      value: 'input',
      filterType: 'numeric'
    }
  ];
  form = new FormGroup({});
  options: FormlyFormOptions = {};
  model: any = {};
  fields: FormlyFieldConfig[] = [
    {
      key: 'filterType',
      type: 'input',
      hooks: {
        onInit: field => {
          field.formControl?.valueChanges
            .pipe(
              distinctUntilChanged(),
              startWith(field.formControl.value),
              tap(value => {
                if (field.parent?.get) {
                  const typeField = field.parent?.get('type');
                  if (typeField && typeField.props) {
                    const result = this.controls.filter(
                      x => x.filterType === value
                    );

                    typeField.props.options = result;

                    if (
                      !result.find(
                        o => o.value === typeField.formControl?.value
                      )
                    )
                      typeField.formControl?.setValue(result[0].value);
                  }
                }
              })
            )
            .subscribe();
        }
      },
      hide: true
    },
    {
      key: 'type',
      type: 'select',
      defaultValue: 'input',
      props: {
        label: 'Control Type',
        placeholder: 'Please Select',
        showClear: false,
        required: true
      },
      hooks: {
        onInit: field => {
          field.formControl?.valueChanges
            .pipe(
              distinctUntilChanged(),
              tap(value => {
                const dField = field.parent?.get?.('defaultValue');
                if (dField != null) {
                  if (dField.props)
                    dField.props['hideLabel'] = value === 'checkbox';

                  dField.hide = true;
                  this.model.selected = false;
                  this.changeDetectorRef.detectChanges();
                  this.model.selected = true;
                  if (
                    'input,datepicker,checkbox,textarea'.indexOf(value) >= 0
                  ) {
                    dField.type = value;
                    dField.hide = false;
                  }
                  this.changeDetectorRef.detectChanges();
                }
              })
            )
            .subscribe();
        }
      }
    },
    {
      key: 'defaultValue',
      type: 'input',
      props: {
        label: 'Default Value',
        placeholder: 'Default Value'
      },
      hooks: {
        onInit: field => {
          field.formControl?.valueChanges
            .pipe(
              distinctUntilChanged(),
              tap(value => {
                this.model.selected = false;
                this.changeDetectorRef.detectChanges();
                this.model.selected = true;
                this.changeDetectorRef.detectChanges();
              })
            )
            .subscribe();
        }
      }
    },
    {
      wrappers: ['divider'],
      props: {
        label: 'Properties'
      }
    },
    {
      key: 'props',
      fieldGroup: [
        {
          key: 'label',
          type: 'input',
          props: {
            label: 'Label',
            placeholder: 'Control label'
          }
        },
        {
          key: 'placeholder',
          type: 'input',
          props: {
            label: 'Placeholder',
            placeholder: 'Placeholder'
          }
        },
        {
          key: 'required',
          type: 'checkbox',
          defaultValue: true,
          props: {
            label: 'Required'
          }
        }
      ]
    }
  ];

  customActions: { label: string | undefined; value: string }[] = [];

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private changeDetectorRef: ChangeDetectorRef,
    private portalItemService: PortalItemService,
    private notifyService: NotifyService,
    @Inject('GRID_ACTION_CONFIG') public customActionsConfig: GridActionConfig[]
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
        this.portalItemService.getGridFormConfig(
          this.portalItemService.currentPortalItemId
        ),
        this.portalItemService.getDataSourceTableColumnsByPortalId(
          this.portalItemService.currentPortalItemId
        )
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
                placeholder: x.columnName
              },
              filterType: x.filterType
            };
          });
      });
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
    } else {
      this.model = {};
    }
  }

  saveGridFormConfig() {
    this.isSaving = true;
    const data = JSON.parse(JSON.stringify(this.formConfig)) as GridFormConfig;
    if (data.allowEdit && !data.useCustomForm)
      data.formFields = this.targetColumns;

    if (this.portalItemService.currentPortalItemId) {
      this.portalItemService
        .saveGridFormConfig(this.portalItemService.currentPortalItemId, data)
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
      this.portalItemService
        .publish(this.portalItemService.currentPortalItemId)
        .subscribe(res => {
          if (!res.isError) {
            this.notifyService.notifySuccess(
              'Success',
              'Save & Publish Successfully Completed.'
            );

            this.router.navigate(['/portal-management/list'], {
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
      this.router.navigate(['/portal-management/list'], {
        relativeTo: this.activatedRoute
      });
    }
  }

  onSaveAndNext() {
    this.isSavingAndNext = true;
    this.saveGridFormConfig();
  }

  onSaveAndExit() {
    this.isSavingAndExit = true;
    this.saveGridFormConfig();
  }

  onBack() {
    this.router.navigate(['../search'], {
      relativeTo: this.activatedRoute
    });
  }

  cloneColumn(column: GridFormField) {
    return [JSON.parse(JSON.stringify(column))];
  }
}

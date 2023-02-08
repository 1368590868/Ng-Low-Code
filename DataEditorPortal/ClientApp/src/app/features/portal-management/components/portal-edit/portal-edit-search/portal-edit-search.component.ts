import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { FormlyFormOptions, FormlyFieldConfig } from '@ngx-formly/core';
import { PrimeNGConfig } from 'primeng/api';
import { PickList } from 'primeng/picklist';
import { distinctUntilChanged, forkJoin, startWith, tap } from 'rxjs';
import { NotifyService } from 'src/app/core';
import { GridSearchField } from '../../../models/portal-item';
import { PortalItemService } from '../../../services/portal-item.service';
import {
  OptionDialogComponent,
  OptionValueModel
} from '../../option-dialog/option-dialog.component';

@Component({
  selector: 'app-portal-edit-search',
  templateUrl: './portal-edit-search.component.html',
  styleUrls: ['./portal-edit-search.component.scss']
})
export class PortalEditSearchComponent implements OnInit {
  isLoading = true;
  isSaving = false;
  isSavingAndNext = false;
  isSavingAndExit = false;

  sourceColumns: GridSearchField[] = [];
  targetColumns: GridSearchField[] = [];
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
      label: 'Multiple Dropdown',
      value: 'multiSelect',
      filterType: 'array'
    },
    {
      label: 'Date',
      value: 'datepicker',
      filterType: 'date'
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
      label: 'Dropdown',
      value: 'select',
      filterType: 'text'
    },
    {
      label: 'Radio List',
      value: 'radio',
      filterType: 'text'
    },
    {
      label: 'Input Number',
      value: 'inputNumber',
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
              tap(() => {
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
            placeholder: 'Enter control label'
          }
        },
        {
          key: 'placeholder',
          type: 'input',
          props: {
            label: 'Placeholder',
            placeholder: 'Enter placeholder'
          },
          expressions: {
            hide: `['checkbox', 'radio', 'checkboxList'].indexOf(field.parent.parent.model.type) >= 0`
          }
        }
      ]
    }
  ];
  filterMatchModeOptions: any[] = [];

  constructor(
    private primeNGConfig: PrimeNGConfig,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private changeDetectorRef: ChangeDetectorRef,
    private portalItemService: PortalItemService,
    private notifyService: NotifyService
  ) {}

  ngOnInit(): void {
    if (this.portalItemService.currentPortalItemId) {
      forkJoin([
        this.portalItemService.getGridSearchConfig(),
        this.portalItemService.getDataSourceTableColumnsByPortalId()
      ]).subscribe(res => {
        this.isLoading = false;
        this.targetColumns = res[0].map<GridSearchField>(x => {
          return {
            ...x,
            selected: true
          };
        });
        this.sourceColumns = res[1]
          .filter(s => !this.targetColumns.find(t => t.key === s.columnName))
          .map<GridSearchField>(x => {
            const result = this.controls.filter(
              c => c.filterType === x.filterType
            );
            return {
              key: x.columnName,
              type: result[0].value,
              props: {
                label: x.columnName
                // placeholder: x.columnName
              },
              filterType: x.filterType,
              searchRule: {
                field: x.columnName
              }
            };
          });
      });

      this.portalItemService.saveCurrentStep('search');
    }
  }

  onMoveToTarget({ items }: { items: GridSearchField[] }) {
    items.forEach(item => {
      item.selected = true;
    });
  }

  onMoveToSource({ items }: { items: GridSearchField[] }) {
    items.forEach(item => {
      item.selected = false;
    });
    if (items.find(x => x.key === this.model.key)) {
      this.model = {};
    }
  }

  onTargetSelect({ items }: { items: GridSearchField[] }) {
    if (items.length === 1) {
      const cacheSearchRule = items[0].searchRule.matchMode;
      this.model = items[0];
      this.filterMatchModeOptions = this.getFilterMatchModeOptions(
        items[0].filterType
      );
      this.changeDetectorRef.detectChanges();
      items[0].searchRule.matchMode = cacheSearchRule;
      this.changeDetectorRef.detectChanges();
    } else {
      this.model = {};
    }
  }

  valid() {
    if (!this.targetColumns || this.targetColumns.length === 0) {
      this.notifyService.notifyWarning(
        'Warning',
        'Please select at least one field.'
      );
      return false;
    }
    return true;
  }

  saveGridSearchConfig() {
    this.isSaving = true;
    if (this.portalItemService.currentPortalItemId) {
      this.portalItemService
        .saveGridSearchConfig(this.targetColumns)
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
    let next: unknown[] = [];
    if (this.isSavingAndNext) {
      next = ['../form'];
    }
    if (this.isSavingAndExit) {
      this.notifyService.notifySuccess(
        'Success',
        'Save Draft Successfully Completed.'
      );
      next = ['../../../list'];
    }
    this.router.navigate(next, {
      relativeTo: this.activatedRoute
    });
  }

  onSaveAndNext() {
    if (!this.valid()) return;
    this.isSavingAndNext = true;
    this.saveGridSearchConfig();
  }

  onSaveAndExit() {
    if (!this.valid()) return;
    this.isSavingAndExit = true;
    this.saveGridSearchConfig();
  }

  onBack() {
    this.router.navigate(['../columns'], {
      relativeTo: this.activatedRoute
    });
  }

  getFilterMatchModeOptions(filterType: string) {
    if (filterType === 'array')
      return [{ label: 'In selected values', value: 'in' }];
    if (filterType === 'boolean') return [{ label: 'Equals', value: 'equals' }];
    return (this.primeNGConfig.filterMatchModeOptions as any)[filterType]?.map(
      (key: any) => {
        return { label: this.primeNGConfig.getTranslation(key), value: key };
      }
    );
  }

  cloneColumn(column: any) {
    return [JSON.parse(JSON.stringify(column))];
  }

  openOptionDialog(optionDialog: OptionDialogComponent) {
    optionDialog.value = {
      isAdvanced: !!this.model.props.optionLookup,
      optionLookup: this.model.props.optionLookup,
      options: this.model.props.options
    };
    optionDialog.showDialog();
  }

  optionValueChange(value: OptionValueModel) {
    if (value.isAdvanced) {
      this.model.props.optionLookup = value.optionLookup;
      this.model.props.options = undefined;
    } else {
      this.model.props.optionLookup = undefined;
      this.model.props.options = value.options;
      this.model.props.dependOnFields = [];
    }
  }
}

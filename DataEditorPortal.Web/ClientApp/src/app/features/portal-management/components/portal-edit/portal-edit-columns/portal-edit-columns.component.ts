import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { FormlyFormOptions, FormlyFieldConfig } from '@ngx-formly/core';
import { PickList } from 'primeng/picklist';
import { forkJoin, tap } from 'rxjs';
import { NotifyService } from 'src/app/shared';
import { DataSourceTableColumn, GridColumn } from '../../../models/portal-item';
import { PortalItemService } from '../../../services/portal-item.service';

@Component({
  selector: 'app-portal-edit-columns',
  templateUrl: './portal-edit-columns.component.html',
  styleUrls: ['./portal-edit-columns.component.scss']
})
export class PortalEditColumnsComponent implements OnInit {
  isLoading = true;
  isSaving = false;
  isSavingAndNext = false;
  isSavingAndExit = false;

  dataSourceTableColumns: DataSourceTableColumn[] = [];
  sourceColumns: GridColumn[] = [];
  targetColumns: GridColumn[] = [];
  @ViewChild('pickList') pickList!: PickList;

  form = new FormGroup({});
  options: FormlyFormOptions = {};
  model: any = {};
  fields: FormlyFieldConfig[] = [
    {
      key: 'type',
      type: 'input',
      props: {
        disabled: true,
        label: 'Column Type'
      }
    },
    {
      key: 'header',
      type: 'input',
      props: {
        label: 'Column Header',
        required: true,
        placeholder: 'Column Header'
      }
    },
    {
      key: 'width',
      defaultValue: '10rem',
      type: 'input',
      props: {
        label: 'Column Width',
        required: true,
        placeholder: 'Enter numeric value in rem or percentage'
      }
    },
    {
      key: 'template',
      type: 'monacoEditor',
      props: {
        label: 'Data Template',
        config: {
          language: 'javascript'
        }
      },
      expressions: {
        hide: `field.parent.model.type !== 'TemplateField'`
      }
    },
    {
      fieldGroup: [
        {
          key: 'filterType',
          type: 'select',
          defaultValue: 'text',
          props: {
            label: 'Filter Type',
            placeholder: 'Please Select',
            required: true,
            showClear: false,
            options: [
              {
                label: 'None',
                value: 'none'
              },
              {
                label: 'Text',
                value: 'text'
              },
              {
                label: 'Numeric',
                value: 'numeric'
              },
              {
                label: 'Boolean',
                value: 'boolean'
              },
              {
                label: 'Date',
                value: 'date'
              },
              {
                label: 'Enums',
                value: 'enums'
              }
            ]
          }
        },
        {
          key: 'sortable',
          type: 'checkbox',
          defaultValue: true,
          props: {
            label: 'Sortable'
          }
        },
        {
          key: 'format',
          type: 'input',
          props: {
            label: 'Data Format'
          },
          expressions: {
            hide: `['numeric','date'].indexOf(field.parent.model.filterType) < 0`
          }
        }
      ],
      expressions: {
        hide: `field.parent.model.type !== 'DataBaseField'`
      }
    }
  ];

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private portalItemService: PortalItemService,
    private notifyService: NotifyService
  ) {}

  ngOnInit(): void {
    if (this.portalItemService.currentPortalItemId) {
      forkJoin([
        this.portalItemService.getGridColumnsConfig(),
        this.portalItemService.getDataSourceTableColumnsByPortalId()
      ]).subscribe(res => {
        this.isLoading = false;
        this.targetColumns = res[0].map<GridColumn>(x => {
          return {
            ...x,
            key: x.field,
            selected: true
          };
        });
        this.sourceColumns = res[1]
          .filter(s => !this.targetColumns.find(t => t.field === s.columnName))
          .map<GridColumn>(x => {
            return {
              type: 'DataBaseField',
              field: x.columnName,
              key: x.columnName,
              filterType: x.filterType,
              header: x.columnName,
              width: '10rem',
              sortable: true
            };
          });
      });

      this.portalItemService.saveCurrentStep('columns');
    }
  }

  onMoveToTarget({ items }: { items: GridColumn[] }) {
    items.forEach(item => {
      item.selected = true;
    });
  }

  onMoveToSource({ items }: { items: GridColumn[] }) {
    items.forEach(item => {
      item.selected = false;
    });
    if (items.find(x => x.field === this.model.field)) {
      this.model = {};
    }
  }

  onTargetSelect({ items }: { items: GridColumn[] }) {
    if (items.length === 1) {
      this.model = items[0];
    } else {
      this.model = {};
    }
  }

  valid() {
    if (!this.targetColumns || this.targetColumns.length === 0) {
      this.notifyService.notifyWarning(
        'Warning',
        'Please select at least one field as column.'
      );
      return false;
    }
    return true;
  }

  saveGridColumnsConfig() {
    this.isSaving = true;
    if (this.portalItemService.currentPortalItemId) {
      this.portalItemService
        .saveGridColumnsConfig(this.targetColumns)
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
      next = ['../search'];
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
    this.saveGridColumnsConfig();
  }

  onSaveAndExit() {
    if (!this.valid()) return;
    this.isSavingAndExit = true;
    this.saveGridColumnsConfig();
  }

  onBack() {
    this.router.navigate(['../datasource'], {
      relativeTo: this.activatedRoute
    });
  }

  onAddTemplateColumn() {
    const count = this.targetColumns.filter(
      x => x.type === 'TemplateField'
    ).length;
    this.targetColumns = [
      {
        type: 'TemplateField',
        field: `Template_${count + 1}`,
        filterType: 'none',
        header: `Template_${count + 1}`,
        width: '10rem',
        selected: true
      },
      ...this.targetColumns
    ];
  }
}

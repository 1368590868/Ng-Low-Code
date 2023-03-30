import {
  Component,
  Inject,
  OnInit,
  ViewChild,
  ViewChildren
} from '@angular/core';
import { FormGroup } from '@angular/forms';
import { FormlyFormOptions } from '@ngx-formly/core';
import { MenuItem } from 'primeng/api';
import { PickList } from 'primeng/picklist';
import { forkJoin, tap } from 'rxjs';
import { NotifyService } from 'src/app/shared';
import { GridFormField, GridSearchField } from '../../../models/portal-item';
import { PortalItemService } from '../../../services/portal-item.service';
import { FormDesignerViewComponent } from '../form-designer/form-designer-view.component';
import { PortalEditStepDirective } from '../portal-edit.component';

@Component({
  selector: 'app-portal-edit-search',
  templateUrl: './portal-edit-search.component.html',
  styleUrls: ['./portal-edit-search.component.scss']
})
export class PortalEditSearchComponent
  extends PortalEditStepDirective
  implements OnInit
{
  isLoading = true;
  isSaving = false;
  isSavingAndNext = false;
  isSavingAndExit = false;

  sourceColumns: GridSearchField[] = [];
  targetColumns: GridSearchField[] = [];
  @ViewChild('pickList') pickList!: PickList;

  form = new FormGroup({});
  options: FormlyFormOptions = {
    formState: {
      dependOnOptions: []
    }
  };
  model: any = {};
  allSelectedFields: { key: string; type: string }[] = [];
  @ViewChildren(FormDesignerViewComponent)
  formDesignerViews!: FormDesignerViewComponent[];

  addCustomSearchModels: MenuItem[] = [
    {
      label: 'Text Field',
      icon: 'pi pi-fw pi-bars',
      command: () => {
        this.onAddCustomColumn('text');
      }
    },
    {
      label: 'Numeric Field',
      icon: 'pi pi-fw pi-percentage',
      command: () => {
        this.onAddCustomColumn('numeric');
      }
    },
    {
      label: 'Boolean Field',
      icon: 'pi pi-fw pi-check-square',
      command: () => {
        this.onAddCustomColumn('boolean');
      }
    },
    {
      label: 'Date Field',
      icon: 'pi pi-fw pi-calendar',
      command: () => {
        this.onAddCustomColumn('date');
      }
    }
  ];

  constructor(
    private portalItemService: PortalItemService,
    private notifyService: NotifyService,
    @Inject('FROM_DESIGNER_CONTROLS') private controls: any[]
  ) {
    super();
  }

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
                field: x.columnName,
                matchMode: this.portalItemService.getFilterMatchModeOptions({
                  filterType: x.filterType,
                  type: result[0].value
                })[0].value
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
      this.model = items[0];

      // update depends on options
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
    if (this.isSavingAndNext) {
      this.saveNextEvent.emit();
    }
    if (this.isSavingAndExit) {
      this.saveDraftEvent.emit();
    }
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
    this.backEvent.emit();
  }

  onAddCustomColumn(filterType: string) {
    const count = this.targetColumns.filter(
      x => x.key.indexOf('CUSTOM_SEARCH_') === 0
    ).length;

    const result = this.controls.filter(c => c.filterType === filterType);
    const key = `CUSTOM_SEARCH_${count + 1}`;

    this.targetColumns = [
      {
        key: key,
        type: result[0].value,
        props: {
          label: key
        },
        filterType: filterType,
        searchRule: {
          field: key,
          whereClause: `${key} = ##VALUE##`
        },
        selected: true
      },
      ...this.targetColumns
    ];
  }
}

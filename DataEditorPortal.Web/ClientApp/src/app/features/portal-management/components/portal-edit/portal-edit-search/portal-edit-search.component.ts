import {
  Component,
  Inject,
  OnInit,
  ViewChild,
  ViewChildren
} from '@angular/core';
import { FormGroup } from '@angular/forms';
import { FormlyFormOptions } from '@ngx-formly/core';
import { ConfirmationService, MenuItem } from 'primeng/api';
import { PickList } from 'primeng/picklist';
import { forkJoin, of, tap } from 'rxjs';
import { NotifyService } from 'src/app/shared';
import {
  DataSourceTableColumn,
  GridFormField,
  GridSearchConfig,
  GridSearchField
} from '../../../models/portal-item';
import { PortalItemService } from '../../../services/portal-item.service';
import { FormDesignerViewComponent } from '../../form-designer/form-designer-view.component';
import { PortalEditStepDirective } from '../../../directives/portal-edit-step.directive';
import { cloneDeep, isEqual } from 'lodash-es';
@Component({
  selector: 'app-portal-edit-search',
  templateUrl: './portal-edit-search.component.html',
  styleUrls: ['./portal-edit-search.component.scss'],
  providers: [ConfirmationService]
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
  options: FormlyFormOptions = {};
  model: any = {};
  @ViewChildren(FormDesignerViewComponent)
  formDesignerViews!: FormDesignerViewComponent[];

  useExistingSearch = false;
  existingSearchOptions: { label: string; value: string }[] = [];
  existingSearchName = '';

  originalConfig: GridSearchConfig = {
    useExistingSearch: false,
    searchFields: [],
    existingSearchName: ''
  };

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

  get itemId() {
    return this.portalItemService.itemId;
  }
  get isLinkedItem() {
    return this.portalItemService.itemType === 'linked';
  }

  constructor(
    private portalItemService: PortalItemService,
    private notifyService: NotifyService,
    private confirmationService: ConfirmationService,
    @Inject('FROM_DESIGNER_CONTROLS') private controls: any[]
  ) {
    super();
  }

  ngOnInit(): void {
    console.log(this.itemId, '11111111111111111');
    if (this.itemId) {
      forkJoin([
        this.portalItemService.getGridSearchConfig(),
        this.isLinkedItem
          ? of<DataSourceTableColumn[]>([])
          : this.portalItemService.getDataSourceTableColumnsByPortalId(),
        this.portalItemService.getPortalItemOptions()
      ]).subscribe(res => {
        this.isLoading = false;
        this.existingSearchOptions = res[2];
        this.targetColumns = res[0].searchFields
          .filter(
            c =>
              c.key.startsWith('CUSTOM_SEARCH_') ||
              !!res[1].find(
                s => s.columnName === c.key && s.filterType === c.filterType
              )
          )
          .map<GridSearchField>(x => {
            return {
              ...x,
              selected: true
            };
          });

        this.originalConfig = {
          useExistingSearch: res[0].useExistingSearch,
          searchFields: cloneDeep(this.targetColumns),
          existingSearchName: res[0].existingSearchName
        };

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
    } else {
      this.model = {};
    }
  }

  configChange(column: GridFormField) {
    const ref = this.formDesignerViews.find(x => x.key === column.key);
    ref?.updateConfig(column);
  }

  valid() {
    if (this.useExistingSearch && !this.existingSearchName) {
      this.notifyService.notifyWarning(
        'Warning',
        'Please select existing search.'
      );
      return false;
    }

    if (
      !this.useExistingSearch &&
      (!this.targetColumns || this.targetColumns.length === 0)
    ) {
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
    if (this.portalItemService.itemId) {
      this.portalItemService
        .saveGridSearchConfig({
          searchFields: this.targetColumns,
          useExistingSearch: this.useExistingSearch,
          existingSearchName: this.existingSearchName
        })
        .pipe(
          tap(res => {
            if (res && res.code === 200) {
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

  dataSourceChanged(): boolean {
    if (this.useExistingSearch) {
      if (this.originalConfig.existingSearchName !== this.existingSearchName) {
        return true;
      }
    } else {
      if (!isEqual(this.originalConfig.searchFields, this.targetColumns)) {
        return true;
      }
    }

    return false;
  }

  saveConfigOrTips() {
    // searchFields and useExistingSearch to initialize data, it is add else edit
    if (
      this.dataSourceChanged() &&
      this.originalConfig.searchFields.length === 0 &&
      !this.originalConfig.existingSearchName &&
      !this.originalConfig.useExistingSearch
    ) {
      this.confirmationService.confirm({
        message:
          'You are going to change the <b>Search configuration</b>.<br><br>' +
          'errors may occur based on previous search configurations, ' +
          'the search criteria selected in association may be incorrect. <br> <br> ' +
          'Are you sure that you want to perform this action?',
        accept: () => this.saveGridSearchConfig()
      });
    } else this.saveGridSearchConfig();
  }

  onSaveAndNext() {
    if (!this.valid()) return;
    this.isSavingAndNext = true;

    this.saveConfigOrTips();
  }

  onSaveAndExit() {
    if (!this.valid()) return;
    this.isSavingAndExit = true;
    this.saveConfigOrTips();
  }

  onBack() {
    this.backEvent.emit();
  }

  onAddCustomColumn(filterType: string) {
    let index = 1;
    for (index = 1; index <= 100; index++) {
      if (!this.targetColumns.find(x => x.key === `CUSTOM_SEARCH_${index}`))
        break;
    }
    const key = `CUSTOM_SEARCH_${index}`;
    const result = this.controls.filter(c => c.filterType === filterType);
    const searchRule = {
      field: key,
      matchMode: this.portalItemService.getFilterMatchModeOptions({
        filterType: filterType,
        type: result[0].value
      })[0].value
    };
    const model = {
      key: key,
      type: result[0].value,
      props: {
        label: key
      },
      filterType: filterType,
      searchRule: { ...searchRule },
      searchRule1: this.isLinkedItem ? { ...searchRule } : undefined,
      selected: true
    };
    this.targetColumns = [model, ...this.targetColumns];
  }

  onRemoveCustomColumn(event: MouseEvent, field: GridSearchField) {
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

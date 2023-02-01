import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { PrimeNGConfig } from 'primeng/api';
import { forkJoin, tap } from 'rxjs';
import { NotifyService } from 'src/app/core';
import {
  DataSourceConfig,
  DataSourceFilter,
  DataSourceSortBy,
  DataSourceTable,
  DataSourceTableColumn
} from '../../../models/portal-item';
import { PortalItemService } from '../../../services/portal-item.service';

@Component({
  selector: 'app-portal-edit-datasource',
  templateUrl: './portal-edit-datasource.component.html',
  styleUrls: ['./portal-edit-datasource.component.scss']
})
export class PortalEditDatasourceComponent implements OnInit {
  isLoading = true;
  isSaving = false;
  isSavingAndNext = false;
  isSavingAndExit = false;

  orginalConfig?: DataSourceConfig;
  datasourceConfig: DataSourceConfig = {
    tableName: '',
    tableSchema: '',
    idColumn: '',
    filters: [],
    sortBy: []
  };
  selectedDbTable?: string;

  dbTables: DataSourceTable[] = [];
  dbTableColumns: DataSourceTableColumn[] = [];
  dbOrderOptions: { label: string; value: string }[] = [
    {
      label: 'ASC',
      value: '0'
    },
    {
      label: 'DESC',
      value: '1'
    }
  ];

  errTableName = false;
  errIdColumn = false;

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private portalItemService: PortalItemService,
    private changeDetectorRef: ChangeDetectorRef,
    private primeNGConfig: PrimeNGConfig,
    private notifyService: NotifyService
  ) {}

  ngOnInit(): void {
    // get protal item datasource config
    if (this.portalItemService.currentPortalItemId) {
      forkJoin([
        this.portalItemService.getDataSourceConfig(),
        // load database tables
        this.portalItemService.getDataSourceTables()
      ]).subscribe(res => {
        const tables = res[1];
        // create label and value for dropdown
        tables.forEach(x => {
          x.label = `${x.tableSchema}.${x.tableName}`;
          x.value = `${x.tableSchema}.${x.tableName}`;
        });
        this.dbTables = tables;
        this.changeDetectorRef.detectChanges();

        // after detect changes, the first table will be selected.
        const dsConfig = res[0];
        if (dsConfig && dsConfig.tableName) {
          dsConfig.filters?.forEach(
            x => (x.matchOptions = this.getFilterMatchModeOptions(x.filterType))
          );
          this.datasourceConfig = dsConfig;
          this.orginalConfig = { ...dsConfig };
          const currentSelected = `${dsConfig.tableSchema}.${dsConfig.tableName}`;

          // check if current selected dbTable exists, if not exist, use the first
          if (!tables.find(x => x.value === currentSelected)) {
            // if no selectedDbTable or the selectedDbTable does not exist in the dropdown options.
            // select the first by default.
            this.selectedDbTable = tables[0].value;
            this.datasourceConfig.tableName = tables[0].tableName;
            this.datasourceConfig.tableSchema = tables[0].tableSchema;
          } else {
            this.selectedDbTable = currentSelected;
          }
        } else {
          // if table schema and table name havn't been stored, use the first from tables.
          this.datasourceConfig.tableName = tables[0].tableName;
          this.datasourceConfig.tableSchema = tables[0].tableSchema;
        }

        this.loadTableColumns();
        this.isLoading = false;
      });

      this.portalItemService.saveCurrentStep('datasource');
    }
  }

  onTableNameChange({ value }: { value: string }) {
    const item = this.dbTables.find(x => x.value === value);
    if (item) {
      this.datasourceConfig.tableName = item.tableName;
      this.datasourceConfig.tableSchema = item.tableSchema;
      this.loadTableColumns();

      // clear the filters and sortBy, as the database table has changed.
      this.datasourceConfig.filters = [];
      this.datasourceConfig.sortBy = [];
    }
  }

  loadTableColumns() {
    if (!this.selectedDbTable) return;
    const [tableSchema, tableName] = this.selectedDbTable.split('.');
    this.portalItemService
      .getDataSourceTableColumns(tableSchema, tableName)
      .pipe(
        tap(res => {
          this.dbTableColumns = res;
          this.changeDetectorRef.detectChanges();
        })
      )
      .subscribe();
  }

  validate() {
    if (!this.datasourceConfig.tableName) {
      this.errTableName = true;
    }
    if (!this.datasourceConfig.idColumn) {
      this.errIdColumn = true;
    }
    this.datasourceConfig.filters.forEach(x => {
      if (!x.value) {
        x.errValue = true;
      }
    });
    return (
      !this.errTableName &&
      !this.errIdColumn &&
      !this.datasourceConfig.filters.reduce<boolean>(
        (r, c) => r || !!c.errValue,
        false
      )
    );
  }

  saveDatasourceConfig() {
    this.isSaving = true;
    if (this.portalItemService.currentPortalItemId) {
      const data = JSON.parse(
        JSON.stringify(this.datasourceConfig)
      ) as DataSourceConfig;
      data.filters?.forEach(x => {
        (x.matchOptions = undefined), (x.errValue = undefined);
      });

      this.portalItemService
        .saveDataSourceConfig(data)
        .pipe(
          tap(res => {
            if (res && !res.isError) {
              if (
                this.orginalConfig &&
                (this.orginalConfig.tableName != data.tableName ||
                  this.orginalConfig?.tableSchema != data.tableSchema)
              ) {
                // if user changed the tableSchema or tableName, user need to continue config column, search, form
                this.portalItemService.currentPortalItemConfigCompleted = false;
              }
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
      this.portalItemService.saveCurrentStep('columns');
      next = ['../columns'];
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
    if (!this.validate()) return;
    this.isSavingAndNext = true;
    this.saveDatasourceConfig();
  }

  onSaveAndExit() {
    if (!this.validate()) return;
    this.isSavingAndExit = true;
    this.saveDatasourceConfig();
  }

  onBack() {
    this.router.navigate(['../basic'], {
      relativeTo: this.activatedRoute
    });
  }

  onAddFilter() {
    if (this.dbTableColumns.length <= 0)
      this.notifyService.notifyWarning('', 'Please select one Database Table.');
    const column = this.dbTableColumns[0];
    const matchOptions = this.getFilterMatchModeOptions(column.filterType);

    const newFilter = [...this.datasourceConfig.filters];
    newFilter.push({
      field: this.dbTableColumns[0].columnName,
      matchOptions,
      matchMode: matchOptions[0].value
    });
    this.datasourceConfig.filters = newFilter;
  }

  getFilterMatchModeOptions(filterType?: string) {
    if (!filterType) filterType = 'text';

    if (filterType === 'array')
      return [{ label: 'In selected values', value: 'in' }];
    if (filterType === 'boolean') return [{ label: 'Equals', value: 'equals' }];
    return (this.primeNGConfig.filterMatchModeOptions as any)[filterType]?.map(
      (key: any) => {
        return { label: this.primeNGConfig.getTranslation(key), value: key };
      }
    );
  }

  onRemoveFilter(filter: DataSourceFilter) {
    const newFilter = [...this.datasourceConfig.filters];
    const index = newFilter.indexOf(filter);
    newFilter.splice(index, 1);
    this.datasourceConfig.filters = newFilter;
  }

  onFilterColumnChange({ value }: { value: string }, filter: DataSourceFilter) {
    const column = this.dbTableColumns.find(x => x.columnName === value);
    if (column) {
      const matchOptions = this.getFilterMatchModeOptions(column.filterType);

      const newFilter = [...this.datasourceConfig.filters];
      const index = newFilter.indexOf(filter);
      newFilter.splice(index, 1, {
        ...filter,
        matchOptions
        // matchMode: matchOptions[0].value
      });
      this.datasourceConfig.filters = newFilter;
    }
  }

  onFilterValueChange(value: string, filter: DataSourceFilter) {
    filter.errValue = !value;
  }

  onAddSortColumn() {
    if (this.dbTableColumns.length <= 0)
      this.notifyService.notifyWarning('', 'Please select one Database Table.');

    const newSortBy = [...this.datasourceConfig.sortBy];
    newSortBy.push({
      field: this.dbTableColumns[0].columnName,
      order: this.dbOrderOptions[0].value
    });
    this.datasourceConfig.sortBy = newSortBy;
  }

  onRemoveSortColumn(sortByColumn: DataSourceSortBy) {
    const newSortBy = [...this.datasourceConfig.sortBy];
    const index = newSortBy.indexOf(sortByColumn);
    newSortBy.splice(index, 1);
    this.datasourceConfig.sortBy = newSortBy;
  }
}

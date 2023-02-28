import { Component, OnInit } from '@angular/core';
import { Form, FormControl } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { PrimeNGConfig } from 'primeng/api';
import { forkJoin, tap } from 'rxjs';
import { NotifyService } from 'src/app/shared';
import {
  DataSourceConfig,
  DataSourceFilter,
  DataSourceSortBy,
  DataSourceTable,
  DataSourceTableColumn
} from '../../../models/portal-item';
import { PortalItemService } from '../../../services/portal-item.service';

interface DataSourceFilterControls {
  formControlField: FormControl;
  formControlMatchMode: FormControl;
  formControlValue: FormControl;
  matchOptions: any[];
  filterType?: string;
}

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

  filters: DataSourceFilterControls[] = [];
  sortBy: DataSourceSortBy[] = [];
  pageSize = 100;

  formControlDbTable: FormControl = new FormControl();
  formControlIdColumn: FormControl = new FormControl();
  formControlQuery: FormControl = new FormControl();

  advanceDialogVisible = false;

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private portalItemService: PortalItemService,
    private primeNGConfig: PrimeNGConfig,
    private notifyService: NotifyService
  ) {}

  ngOnInit(): void {
    this.formControlDbTable.valueChanges.subscribe(value => {
      if (value) {
        const [tableSchema, tableName] = value.split('.');
        this.datasourceConfig.tableName = tableName;
        this.datasourceConfig.tableSchema = tableSchema;
      } else {
        this.datasourceConfig.tableName = '';
        this.datasourceConfig.tableSchema = '';
      }
    });
    this.formControlIdColumn.valueChanges.subscribe(
      value => (this.datasourceConfig.idColumn = value)
    );

    // get protal item datasource config
    if (this.portalItemService.currentPortalItemId) {
      forkJoin([
        this.portalItemService.getDataSourceConfig(),
        // load database tables
        this.portalItemService.getDataSourceTables()
      ]).subscribe(res => {
        this.isLoading = false;
        const tables: DataSourceTable[] = res[1];
        if (tables.length === 0) return;

        // create label and value for dropdown
        tables.forEach(x => {
          x.label = `${x.tableSchema}.${x.tableName}`;
          x.value = `${x.tableSchema}.${x.tableName}`;
        });
        this.dbTables = tables;

        const dsConfig = res[0];
        this.datasourceConfig = dsConfig;
        this.orginalConfig = { ...dsConfig };

        if (!dsConfig.queryText) {
          // set form control
          const selectedDbTable = `${dsConfig.tableSchema}.${dsConfig.tableName}`;
          // check if current selected dbTable exists, if not exist, use the first
          if (!tables.find(x => x.value === selectedDbTable)) {
            this.formControlDbTable.setValue(tables[0].value);
          } else {
            this.formControlDbTable.setValue(selectedDbTable);
          }
        } else {
          this.formControlQuery.setValue(dsConfig.queryText);
        }

        // set filters
        if (dsConfig.filters) {
          this.filters = dsConfig.filters.map<DataSourceFilterControls>(x => {
            return {
              matchOptions: this.getFilterMatchModeOptions(x.filterType),
              filterType: x.filterType,
              formControlField: new FormControl(x.field),
              formControlMatchMode: new FormControl(x.matchMode),
              formControlValue: new FormControl(x.value)
            };
          });
        }

        // set sortby
        if (dsConfig.sortBy) {
          this.sortBy = dsConfig.sortBy;
        }

        // set pageSize
        if (dsConfig.pageSize && dsConfig.pageSize >= 10)
          this.pageSize = dsConfig.pageSize;

        this.loadTableColumns();
      });

      this.portalItemService.saveCurrentStep('datasource');
    }
  }

  //* advanced query dialog */
  helperMessage =
    '-- Enter the query text for fetching the data. \r\n\r\n' +
    '-- E.g. \r\n' +
    '-- SELECT * FROM dbo.demoTables WHERE ##WHERE## AND ##SEARCHES## AND ##FILTERS## ORDER BY ##ORDERBY##';

  showAdvanceDialog() {
    this.advanceDialogVisible = true;
    this.formControlQuery.reset();
    if (this.datasourceConfig.queryText)
      this.formControlQuery.setValue(this.datasourceConfig.queryText);
    else this.formControlQuery.setValue(this.helperMessage);
  }

  onAdvanceDialogOk() {
    if (
      this.formControlQuery.valid &&
      this.formControlQuery.value != this.helperMessage
    ) {
      this.portalItemService
        .getDataSourceTableColumnsByQuery(this.formControlQuery.value)
        .subscribe(res => {
          if (!res.isError) {
            this.datasourceConfig.queryText = this.formControlQuery.value;
            this.advanceDialogVisible = false;
            this.setColumns(res.result || []);
            // clear the filters and sortBy, as the database table has changed.
            this.filters = [];
            this.sortBy = [];
          }
        });
    } else {
      this.notifyService.notifyWarning('', 'Query text is required.');
      this.formControlQuery.markAsDirty();
    }
  }

  onAdvanceDialogCancel() {
    this.advanceDialogVisible = false;
  }

  removeAdvancedQuery() {
    this.datasourceConfig.queryText = undefined;
    this.formControlDbTable.setValue(this.dbTables[0].value);
    this.loadTableColumns();

    // clear the filters and sortBy, as the database table has changed.
    this.filters = [];
    this.sortBy = [];
  }
  //* advanced query dialog */

  onTableNameChange({ value }: { value: string }) {
    const item = this.dbTables.find(x => x.value === value);
    if (item) {
      this.loadTableColumns();

      // clear the filters and sortBy, as the database table has changed.
      this.filters = [];
      this.sortBy = [];
    }
  }

  loadTableColumns() {
    if (this.datasourceConfig.queryText) {
      this.portalItemService
        .getDataSourceTableColumnsByQuery(this.datasourceConfig.queryText)
        .subscribe(res => this.setColumns(res.result || []));
    } else {
      const selectedDbTable = this.formControlDbTable.value;
      if (!selectedDbTable) return;
      const [tableSchema, tableName] = selectedDbTable.split('.');
      this.portalItemService
        .getDataSourceTableColumns(tableSchema, tableName)
        .subscribe(res => this.setColumns(res));
    }
  }

  setColumns(res: DataSourceTableColumn[]) {
    this.dbTableColumns = res;
    if (
      !this.datasourceConfig.idColumn ||
      !res.find(x => x.columnName === this.datasourceConfig.idColumn)
    ) {
      this.formControlIdColumn.setValue(res[0].columnName);
    } else {
      this.formControlIdColumn.setValue(this.datasourceConfig.idColumn);
    }
  }

  validate() {
    if (!this.datasourceConfig.queryText) {
      if (!this.formControlDbTable.valid) {
        this.formControlDbTable.markAsDirty();
        this.formControlDbTable.updateValueAndValidity();
      }
    }

    if (!this.formControlIdColumn.valid) {
      this.formControlIdColumn.markAsDirty();
      this.formControlIdColumn.updateValueAndValidity();
    }

    const filterValid = this.filters.reduce((r, x) => {
      if (!x.formControlValue.valid) {
        x.formControlValue.markAsDirty();
        x.formControlValue.updateValueAndValidity();
      }
      return r && x.formControlValue.valid;
    }, true);

    return (
      (this.datasourceConfig.queryText || this.formControlDbTable.valid) &&
      this.formControlIdColumn.valid &&
      filterValid
    );
  }

  saveDatasourceConfig() {
    this.isSaving = true;
    if (this.portalItemService.currentPortalItemId) {
      const data: DataSourceConfig = {
        pageSize: this.pageSize,
        idColumn: this.datasourceConfig.idColumn,
        filters: this.filters.map<DataSourceFilter>(x => {
          return {
            field: x.formControlField.value,
            matchMode: x.formControlMatchMode.value,
            value: x.formControlValue.value,
            filterType: x.filterType
          };
        }),
        sortBy: this.sortBy
      };
      if (!this.datasourceConfig.queryText) {
        data.tableName = this.datasourceConfig.tableName;
        data.tableSchema = this.datasourceConfig.tableSchema;
      } else {
        data.queryText = this.formControlQuery.value;
      }

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

    const newFilter = [...this.filters];
    newFilter.push({
      filterType: column.filterType,
      matchOptions,
      formControlField: new FormControl(column.columnName),
      formControlMatchMode: new FormControl(matchOptions[0].value),
      formControlValue: new FormControl()
    });
    this.filters = newFilter;
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

  onRemoveFilter(filter: DataSourceFilterControls) {
    const newFilter = [...this.filters];
    const index = newFilter.indexOf(filter);
    newFilter.splice(index, 1);
    this.filters = newFilter;
  }

  onFilterColumnChange(
    { value }: { value: string },
    filter: DataSourceFilterControls
  ) {
    const column = this.dbTableColumns.find(x => x.columnName === value);
    if (column) {
      filter.matchOptions = this.getFilterMatchModeOptions(column.filterType);
      filter.filterType = column.filterType;
      filter.formControlMatchMode.setValue(filter.matchOptions[0].value);

      const newFilter = [...this.filters];
      const index = newFilter.indexOf(filter);
      newFilter.splice(index, 1, filter);
      this.filters = newFilter;
    }
  }

  onAddSortColumn() {
    if (this.dbTableColumns.length <= 0)
      this.notifyService.notifyWarning('', 'Please select one Database Table.');

    const newSortBy = [...this.sortBy];
    newSortBy.push({
      field: this.dbTableColumns[0].columnName,
      order: this.dbOrderOptions[0].value
    });
    this.sortBy = newSortBy;
  }

  onRemoveSortColumn(sortByColumn: DataSourceSortBy) {
    const newSortBy = [...this.sortBy];
    const index = newSortBy.indexOf(sortByColumn);
    newSortBy.splice(index, 1);
    this.sortBy = newSortBy;
  }
}

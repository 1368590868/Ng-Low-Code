import { Component, OnInit } from '@angular/core';
import { Form, FormControl } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ConfirmationService, PrimeNGConfig } from 'primeng/api';
import { forkJoin, tap } from 'rxjs';
import { NotifyService } from 'src/app/shared';
import {
  DataSourceConfig,
  DataSourceConnection,
  DataSourceFilter,
  DataSourceSortBy,
  DataSourceTable,
  DataSourceTableColumn
} from '../../../models/portal-item';
import { PortalItemService } from '../../../services/portal-item.service';
import { AdvancedQueryModel } from './advanced-query-dialog/advanced-query-dialog.component';

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
  styleUrls: ['./portal-edit-datasource.component.scss'],
  providers: [ConfirmationService]
})
export class PortalEditDatasourceComponent implements OnInit {
  isLoading = true;
  isSaving = false;
  isSavingAndNext = false;
  isSavingAndExit = false;

  orginalConfig?: DataSourceConfig;
  datasourceConfig: DataSourceConfig = {
    dataSourceConnectionId: '',
    tableName: '',
    tableSchema: '',
    idColumn: '',
    filters: [],
    sortBy: [],
    pageSize: 100
  };

  dbConnections: { label: string; value: string }[] = [];
  dbTables: DataSourceTable[] = [];
  dbTableColumns: DataSourceTableColumn[] = [];
  dbOrderOptions: { label: string; value: number }[] = [
    {
      label: 'ASC',
      value: 0
    },
    {
      label: 'DESC',
      value: 1
    }
  ];

  filters: DataSourceFilterControls[] = [];
  sortBy: DataSourceSortBy[] = [];
  pageSize = 100;

  formControlConnection: FormControl = new FormControl();
  formControlDbTable: FormControl = new FormControl();
  formControlIdColumn: FormControl = new FormControl();

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private portalItemService: PortalItemService,
    private primeNGConfig: PrimeNGConfig,
    private notifyService: NotifyService,
    private confirmationService: ConfirmationService
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
    this.formControlConnection.valueChanges.subscribe(
      value => (this.datasourceConfig.dataSourceConnectionId = value)
    );

    // get protal item datasource config
    if (this.portalItemService.currentPortalItemId) {
      forkJoin([
        this.portalItemService.getDataSourceConfig(),
        // load database tables
        this.portalItemService.getDataSourceConnections()
      ]).subscribe(res => {
        this.isLoading = false;
        const connections: DataSourceConnection[] = res[1];
        if (connections.length === 0) return;
        this.dbConnections = connections.map(x => {
          return { label: x.name, value: x.id || '' };
        });

        const dsConfig = res[0];
        this.datasourceConfig = dsConfig;
        this.orginalConfig = { ...dsConfig };

        // check if current selected connections exists, if not exist, use the first
        if (!connections.find(x => x.id === dsConfig.dataSourceConnectionId)) {
          this.formControlConnection.setValue(connections[0].id);
        } else {
          this.formControlConnection.setValue(dsConfig.dataSourceConnectionId);
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

        this.getDbTables();
      });

      this.portalItemService.saveCurrentStep('datasource');
    }
  }

  /* advanced query dialog */
  queryChange({ queryText, columns }: AdvancedQueryModel) {
    this.datasourceConfig.queryText = queryText;
    this.setColumns(columns);
    // db query added or updated, need to clear configurations base on previous db table or query.
    this.filters = [];
    this.sortBy = [];
  }

  removeAdvancedQuery() {
    this.datasourceConfig.queryText = undefined;
    this.formControlDbTable.setValue(this.dbTables[0].value);
    // db query removed and db table changed, need to clear configurations base on previous db query.
    this.filters = [];
    this.sortBy = [];

    this.getDbTableColumns();
  }
  /* advanced query dialog */

  /* db connection dialog */
  connectionSaved(item: { label: string; value: string }) {
    this.dbConnections.push(item);
    this.formControlConnection.setValue(item.value);
    this.onConnectionChange(item);
  }
  /* db connection dialog */

  onConnectionChange({ value }: { value: string }) {
    const item = this.dbConnections.find(x => x.value === value);
    if (item) {
      // db connection changed, need to clear configurations base on previous connection.
      this.datasourceConfig.queryText = undefined;
      this.filters = [];
      this.sortBy = [];

      this.getDbTables();
    }
  }

  onTableNameChange({ value }: { value: string }) {
    const item = this.dbTables.find(x => x.value === value);
    if (item) {
      // db table changed, need to clear configurations base on previous db table.
      this.filters = [];
      this.sortBy = [];

      this.getDbTableColumns();
    }
  }

  getDbTables() {
    this.portalItemService
      .getDataSourceTables(this.formControlConnection.value)
      .subscribe(res => {
        const tables: DataSourceTable[] = res;
        if (tables.length === 0) return;

        // create label and value for dropdown
        tables.forEach(x => {
          x.label = `${x.tableSchema}.${x.tableName}`;
          x.value = `${x.tableSchema}.${x.tableName}`;
        });
        this.dbTables = tables;

        if (!this.datasourceConfig.queryText) {
          const selectedDbTable = `${this.datasourceConfig.tableSchema}.${this.datasourceConfig.tableName}`;
          // check if current selected dbTable exists, if not exist, use the first
          if (!tables.find(x => x.value === selectedDbTable)) {
            this.formControlDbTable.setValue(tables[0].value);
          } else {
            this.formControlDbTable.setValue(selectedDbTable);
          }
        }

        this.getDbTableColumns();
      });
  }

  getDbTableColumns() {
    if (this.datasourceConfig.queryText) {
      this.portalItemService
        .getDataSourceTableColumnsByQuery(
          this.formControlConnection.value,
          this.datasourceConfig.queryText
        )
        .subscribe(res => this.setColumns(res.result || []));
    } else {
      const selectedDbTable = this.formControlDbTable.value;
      if (!selectedDbTable) return;
      const [tableSchema, tableName] = selectedDbTable.split('.');
      this.portalItemService
        .getDataSourceTableColumns(
          this.formControlConnection.value,
          tableSchema,
          tableName
        )
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
    if (!this.formControlConnection.valid) {
      this.formControlConnection.markAsDirty();
      this.formControlConnection.updateValueAndValidity();
    }

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
      this.formControlConnection.valid &&
      (this.datasourceConfig.queryText || this.formControlDbTable.valid) &&
      this.formControlIdColumn.valid &&
      filterValid
    );
  }

  saveDatasourceConfig() {
    const save = () => {
      this.isSaving = true;
      if (this.portalItemService.currentPortalItemId) {
        const data: DataSourceConfig = {
          dataSourceConnectionId: this.datasourceConfig.dataSourceConnectionId,
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
          data.queryText = this.datasourceConfig.queryText;
        }

        this.portalItemService
          .saveDataSourceConfig(data)
          .pipe(
            tap(res => {
              if (res && !res.isError) {
                if (this.dataSourceChanged()) {
                  // if user changed the tableSchema or tableName, user need to continue config column, search, form
                  this.portalItemService.currentPortalItemConfigCompleted =
                    false;
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
    };

    if (this.dataSourceChanged()) {
      this.confirmationService.confirm({
        message:
          'You are going to change the <b>Data Source</b>.<br><br>' +
          'The column settings, search settings and form settings based on previous data source will be removed, ' +
          'and you need to complete them before preview this portal item. <br> <br>' +
          'Are you sure that you want to perform this action?',
        accept: save
      });
    } else {
      save();
    }
  }

  dataSourceChanged() {
    return (
      this.orginalConfig &&
      (this.datasourceConfig.dataSourceConnectionId !=
        this.orginalConfig.dataSourceConnectionId ||
        this.datasourceConfig.queryText != this.orginalConfig.queryText ||
        this.datasourceConfig.tableName != this.orginalConfig.tableName ||
        this.datasourceConfig.tableSchema != this.orginalConfig.tableSchema)
    );
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
    this.isSavingAndExit = false;
    this.saveDatasourceConfig();
  }

  onSaveAndExit() {
    if (!this.validate()) return;
    this.isSavingAndNext = false;
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
      this.notifyService.notifyWarning(
        '',
        'Please complete Database Connection, Database Table or Database Query first.'
      );
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
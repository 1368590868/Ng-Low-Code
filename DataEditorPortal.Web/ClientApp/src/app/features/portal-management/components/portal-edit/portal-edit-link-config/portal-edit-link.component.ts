import { Component, OnInit, ViewChild, ViewChildren } from '@angular/core';
import { PortalEditStepDirective } from '../../../directives/portal-edit-step.directive';
import { PortalItemService } from '../../../services/portal-item.service';
import { NotifyService } from 'src/app/shared';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import {
  DataSourceConfig,
  DataSourceConnection,
  DataSourceTable,
  DataSourceTableColumn,
  LinkedDataSourceConfig,
  LinkedSingleConfig
} from '../../../models/portal-item';
import { FormControl, NgModel } from '@angular/forms';
import { AdvancedQueryModel } from '..';
import { CustomActionsComponent } from '../..';
@Component({
  selector: 'app-portal-edit-link',
  templateUrl: './portal-edit-link.component.html',
  styleUrls: ['./portal-edit-link.component.scss']
})
export class PortalEditLinkComponent
  extends PortalEditStepDirective
  implements OnInit
{
  @ViewChild('customActions') customActions!: CustomActionsComponent;
  @ViewChildren('validationRef') validationRef!: NgModel[];
  isLoading = true;
  isSaving = false;
  isSavingAndNext = false;
  isSavingAndExit = false;

  set itemId(val: string | undefined) {
    this.portalItemService.itemId = val;
  }
  get itemId() {
    return this.portalItemService.itemId;
  }

  dataSourceConfig!: LinkedDataSourceConfig;
  primaryTableConfig!: LinkedSingleConfig;
  secondaryTableConfig!: LinkedSingleConfig;
  secondarySelected: string[] = [];
  primarySelected: string[] = [];

  dbConnections: { label: string; value: string }[] = [];
  dsConfig: DataSourceConfig = {
    dataSourceConnectionName: '',
    tableName: '',
    tableSchema: '',
    idColumn: '',
    primaryForeignKey: '',
    secondaryForeignKey: ''
  };
  dbTables: DataSourceTable[] = [];
  dbTableColumns: DataSourceTableColumn[] = [];

  formControlConnection: FormControl = new FormControl();
  formControlDbTable: FormControl = new FormControl();
  formControlIdColumn: FormControl = new FormControl();
  formControlPrimaryMap: FormControl = new FormControl();
  formControlSecondaryMap: FormControl = new FormControl();
  formControlPrimaryReference: FormControl = new FormControl();
  formControlSecondaryReference: FormControl = new FormControl();

  showQuery = false;
  helperMessage =
    'E.g. <br /><br />' +
    'INSERT INTO DEMO_TABLE (ID, NAME, FIRST_NAME, TOTAL, CREATED_DATE) <br />VALUES (NEWID(), ##NAME##, ##FIRST_NAME##, ##TOTAL##, GETDATE())';
  formControlQueryText: FormControl = new FormControl();

  constructor(
    private portalItemService: PortalItemService,
    private router: Router,
    private route: ActivatedRoute,
    private notifyService: NotifyService
  ) {
    super();
  }

  ngOnInit(): void {
    this.formControlDbTable.valueChanges.subscribe(value => {
      if (value) {
        const [tableSchema, tableName] = value.split('.');
        this.dsConfig.tableName = tableName;
        this.dsConfig.tableSchema = tableSchema;
      } else {
        this.dsConfig.tableName = '';
        this.dsConfig.tableSchema = '';
      }
    });
    this.formControlIdColumn.valueChanges.subscribe(
      value => (this.dsConfig.idColumn = value)
    );
    this.formControlConnection.valueChanges.subscribe(
      value => (this.dsConfig.dataSourceConnectionName = value)
    );

    this.portalItemService.saveCurrentStep('datasource');
    this.portalItemService
      .getLinkedDatasource(this.itemId as string)
      .subscribe(res => {
        if (!res.isError) {
          const { result } = res;
          this.dataSourceConfig = result || {};
          this.isLoading = false;

          this.primarySelected =
            this.dataSourceConfig.primaryTable?.columnsForLinkedField || [];
          this.secondarySelected =
            this.dataSourceConfig.secondaryTable?.columnsForLinkedField || [];
          this.formControlPrimaryMap.setValue(
            this.dataSourceConfig.linkTable?.primaryForeignKey
          );
          this.formControlSecondaryMap.setValue(
            this.dataSourceConfig.linkTable?.secondaryForeignKey
          );

          this.showQuery = !!result?.linkTable?.queryInsert;

          this.formControlQueryText.setValue(result?.linkTable?.queryInsert);

          if (result?.primaryTable?.id != null) {
            this.portalItemService
              .getLinkedSingleTableConfig(result.primaryTable.id)
              .subscribe(item => {
                this.primaryTableConfig = item;
                const filteredData = this.primarySelected.filter(
                  x => !!item.gridColumns.find(y => y.value === x)
                );
                if (filteredData.length < this.primarySelected.length) {
                  this.primarySelected = filteredData;
                }

                this.formControlPrimaryReference.setValue(
                  this.dataSourceConfig.linkTable?.primaryReferenceKey ??
                    item?.idColumn
                );
              });
          }

          if (result?.secondaryTable?.id != null) {
            this.portalItemService
              .getLinkedSingleTableConfig(result.secondaryTable.id)
              .subscribe(item => {
                this.secondaryTableConfig = item;
                const filteredData = this.secondarySelected.filter(
                  x => !!item.gridColumns.find(y => y.value === x)
                );
                if (filteredData.length < this.secondarySelected.length) {
                  this.secondarySelected = filteredData;
                }

                this.formControlSecondaryReference.setValue(
                  this.dataSourceConfig.linkTable?.secondaryReferenceKey ??
                    item?.idColumn
                );
              });
          }

          if (result?.linkTable) {
            this.dsConfig = result.linkTable;
          }
        }
      });

    // load database tables
    this.portalItemService.getDataSourceConnections().subscribe(res => {
      this.isLoading = false;
      const connections: DataSourceConnection[] = res;
      if (connections.length === 0) return;
      this.dbConnections = connections.map(x => {
        return { label: x.name, value: x.name || '' };
      });
      // check if current selected connections exists, if not exist, use the first
      if (
        !connections.find(
          x => x.name === this.dsConfig?.dataSourceConnectionName
        )
      ) {
        this.formControlConnection.setValue(connections[0].name);
      } else {
        this.formControlConnection.setValue(
          this.dsConfig?.dataSourceConnectionName
        );
      }

      this.getDbTables();
    });
  }

  onShowAction(id: string) {
    this.customActions.portalItemId = id;
    this.customActions.showDialog();
  }

  onEditTable(tableId: string) {
    this.onSave().subscribe(res => {
      if (!res.isError) {
        this.saveSucess();
        this.router.navigate([`./edit/${tableId}`], {
          relativeTo: this.route
        });
      }
      this.clearStatus();
    });
  }

  onAddPrimaryTable() {
    this.onSave().subscribe(res => {
      if (!res.isError) {
        this.saveSucess();
        this.router.navigate(['./add'], { relativeTo: this.route });
      }
      this.clearStatus();
    });
  }

  onAddSecondaryTable() {
    if (this.dataSourceConfig.primaryTable == null) {
      this.notifyService.notifyWarning(
        'Warning',
        'Please select primary table first.'
      );
    } else {
      this.onSave().subscribe(res => {
        if (!res.isError) {
          this.saveSucess();
          this.router.navigate(['./add'], { relativeTo: this.route });
        }
        this.clearStatus();
      });
    }
  }

  valid() {
    if (
      this.primarySelected.length === 0 ||
      this.secondarySelected.length === 0 ||
      this.dsConfig.dataSourceConnectionName == null ||
      this.dsConfig.idColumn == null ||
      this.formControlPrimaryMap.value == null ||
      this.formControlSecondaryMap.value == null ||
      this.formControlPrimaryReference.value == null ||
      this.formControlSecondaryReference.value == null
    ) {
      this.formControlSecondaryMap.markAsDirty();
      this.formControlPrimaryMap.markAsDirty();
      this.formControlPrimaryReference.markAsDirty();
      this.formControlSecondaryReference.markAsDirty();
      this.validationRef.forEach(x => {
        x.control.markAsDirty();
      });
      if (
        !this.primaryTableConfig?.details ||
        !this.secondaryTableConfig?.details ||
        this.primaryTableConfig.details[0].configCompleted === false ||
        this.secondaryTableConfig.details[0].configCompleted === false
      ) {
        this.notifyService.notifyWarning(
          'Warning',
          'Please complete the configuration for primary table and secondary table.'
        );
      }
      return false;
    }
    return true;
  }

  onSaveAndNext() {
    if (!this.validate()) return;
    this.isSavingAndNext = true;

    if (this.valid()) {
      this.onSave().subscribe(res => {
        if (!res.isError) {
          this.saveSucess();
        }
        this.clearStatus();
      });
    }
  }

  onSaveAndExit() {
    if (!this.validate()) return;
    this.isSavingAndExit = true;
    this.onSave().subscribe(res => {
      if (!res.isError) {
        this.saveSucess();
      }
      this.clearStatus();
    });
  }

  clearStatus() {
    this.isSaving = false;
    this.isSavingAndExit = false;
    this.isSavingAndNext = false;
  }

  onSave() {
    const data: DataSourceConfig = {
      dataSourceConnectionName: this.dsConfig.dataSourceConnectionName,
      idColumn: this.dsConfig.idColumn,
      primaryForeignKey: this.formControlPrimaryMap.value,
      secondaryForeignKey: this.formControlSecondaryMap.value,
      primaryReferenceKey: this.formControlPrimaryReference.value,
      secondaryReferenceKey: this.formControlSecondaryReference.value,
      queryInsert: this.formControlQueryText.value
    };
    if (!this.dsConfig.queryText) {
      data.tableName = this.dsConfig.tableName;
      data.tableSchema = this.dsConfig.tableSchema;
    } else {
      data.queryText = this.dsConfig.queryText;
    }
    return this.portalItemService.saveLinkedDatasource({
      primaryTable: this.dataSourceConfig.primaryTable?.id
        ? {
            id: this.dataSourceConfig.primaryTable?.id,
            columnsForLinkedField: this.primarySelected
          }
        : null,
      secondaryTable: this.dataSourceConfig.secondaryTable?.id
        ? {
            id: this.dataSourceConfig.secondaryTable?.id,
            columnsForLinkedField: this.secondarySelected
          }
        : null,
      linkTable: data
    });
  }

  saveSucess() {
    if (this.isSavingAndNext) {
      this.saveNextEvent.emit();
    }
    if (this.isSavingAndExit) {
      this.saveDraftEvent.emit();
    }
  }

  onBack() {
    this.backEvent.emit();
  }

  // datasource connect
  onConnectionChange({ value }: { value: string }) {
    const item = this.dbConnections.find(x => x.value === value);
    if (item) {
      // db connection changed, need to clear configurations base on previous connection.
      this.dsConfig.queryText = undefined;

      this.getDbTables();
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

        if (!this.dsConfig.queryText) {
          const selectedDbTable = `${this.dsConfig.tableSchema}.${this.dsConfig.tableName}`;
          // check if current selected dbTable exists, if not exist, use the first
          if (tables.find(x => x.value === selectedDbTable)) {
            this.formControlDbTable.setValue(selectedDbTable);
          }
        }

        this.getDbTableColumns();
      });
  }

  /* db connection dialog */
  connectionSaved(name: string) {
    const item = { label: name, value: name };
    this.dbConnections.push(item);
    this.formControlConnection.setValue(item.value);
    this.onConnectionChange(item);
  }

  onTableNameChange({ value }: { value: string }) {
    const item = this.dbTables.find(x => x.value === value);
    if (item) {
      this.getDbTableColumns();
    }
  }

  setColumns(res: DataSourceTableColumn[]) {
    this.dbTableColumns = res;
    if (
      !this.dsConfig.idColumn ||
      !res.find(x => x.columnName === this.dsConfig.idColumn)
    ) {
      this.formControlIdColumn.setValue(res[0].columnName);
    } else {
      this.formControlIdColumn.setValue(this.dsConfig.idColumn);
    }
  }

  validate() {
    if (!this.formControlConnection.valid) {
      this.formControlConnection.markAsDirty();
      this.formControlConnection.updateValueAndValidity();
    }

    if (!this.formControlDbTable.valid) {
      this.formControlDbTable.markAsDirty();
      this.formControlDbTable.updateValueAndValidity();
    }

    if (!this.formControlIdColumn.valid) {
      this.formControlIdColumn.markAsDirty();
      this.formControlIdColumn.updateValueAndValidity();
    }

    return (
      this.formControlConnection.valid &&
      this.formControlDbTable.valid &&
      this.formControlIdColumn.valid
    );
  }

  getDbTableColumns() {
    if (this.dsConfig.queryText) {
      this.portalItemService
        .getDataSourceTableColumnsByQuery(
          this.formControlConnection.value,
          this.dsConfig.queryText
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

  /* advanced query dialog */
  queryChange({ queryText, columns }: AdvancedQueryModel) {
    this.dsConfig.queryText = queryText;
    this.setColumns(columns);
  }
  removeAdvancedQuery() {
    this.dsConfig.queryText = undefined;
    this.formControlDbTable.setValue(null);

    this.getDbTableColumns();
  }
}

import { Component, OnInit, ViewChild } from '@angular/core';
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
import { FormControl } from '@angular/forms';
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
    dataSourceConnectionId: '',
    tableName: '',
    tableSchema: '',
    idColumn: ''
  };
  dbTables: DataSourceTable[] = [];
  dbTableColumns: DataSourceTableColumn[] = [];
  formControlConnection: FormControl = new FormControl();
  formControlDbTable: FormControl = new FormControl();
  formControlIdColumn: FormControl = new FormControl();
  formControlPrimaryMap: FormControl = new FormControl();
  formControlSecondaryMap: FormControl = new FormControl();

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
      value => (this.dsConfig.dataSourceConnectionId = value)
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
            this.dataSourceConfig.primaryTable?.mapToLinkedTableField
          );
          this.formControlSecondaryMap.setValue(
            this.dataSourceConfig.secondaryTable?.mapToLinkedTableField
          );

          if (result?.primaryTable?.id != null) {
            this.portalItemService
              .getLinkedSingleTableConfig(result.primaryTable.id)
              .subscribe(item => {
                this.primaryTableConfig = item;
              });
          }

          if (result?.secondaryTable?.id != null) {
            this.portalItemService
              .getLinkedSingleTableConfig(result.secondaryTable.id)
              .subscribe(item => {
                this.secondaryTableConfig = item;
              });
          }

          if (result?.linkedTable) {
            this.dsConfig = result.linkedTable;
          }
        }
      });

    // load database tables
    this.portalItemService.getDataSourceConnections().subscribe(res => {
      this.isLoading = false;
      const connections: DataSourceConnection[] = res;
      if (connections.length === 0) return;
      this.dbConnections = connections.map(x => {
        return { label: x.name, value: x.id || '' };
      });
      // check if current selected connections exists, if not exist, use the first
      if (
        !connections.find(x => x.id === this.dsConfig?.dataSourceConnectionId)
      ) {
        this.formControlConnection.setValue(connections[0].id);
      } else {
        this.formControlConnection.setValue(
          this.dsConfig?.dataSourceConnectionId
        );
      }

      this.getDbTables();
    });
  }

  onShowAction(id: string) {
    this.customActions.portalItemId = id;
    this.customActions.showDialog();
  }

  onAddSecondaryTable() {
    if (this.dataSourceConfig.primaryTable == null) {
      this.notifyService.notifyWarning(
        'Warning',
        'Please select primary table first.'
      );
    } else {
      this.router.navigate(['./add'], { relativeTo: this.route });
    }
  }

  valid() {
    if (
      !this.primaryTableConfig?.details ||
      !this.secondaryTableConfig?.details ||
      this.primarySelected.length === 0 ||
      this.secondarySelected.length === 0 ||
      this.dsConfig.dataSourceConnectionId == null ||
      this.dsConfig.idColumn == null ||
      this.formControlPrimaryMap.value == null ||
      this.formControlSecondaryMap.value == null
    ) {
      this.notifyService.notifyWarning('Warning', 'Please Check Your Data.');
      return false;
    }
    return true;
  }

  onSaveAndNext() {
    this.isSavingAndNext = true;

    if (this.valid()) {
      const data: DataSourceConfig = {
        dataSourceConnectionId: this.dsConfig.dataSourceConnectionId,
        idColumn: this.dsConfig.idColumn
      };
      if (!this.dsConfig.queryText) {
        data.tableName = this.dsConfig.tableName;
        data.tableSchema = this.dsConfig.tableSchema;
      } else {
        data.queryText = this.dsConfig.queryText;
      }
      this.portalItemService
        .saveLinkedDatasource({
          primaryTable: {
            id: this.dataSourceConfig.primaryTable?.id,
            columnsForLinkedField: this.primarySelected,
            mapToLinkedTableField: this.formControlPrimaryMap.value
          },
          secondaryTable: {
            id: this.dataSourceConfig.secondaryTable?.id,
            columnsForLinkedField: this.secondarySelected,
            mapToLinkedTableField: this.formControlSecondaryMap.value
          },
          linkedTable: data
        })
        .subscribe(res => {
          if (!res.isError) {
            this.saveSucess();
          }
        });
    }
  }

  onSaveAndExit() {
    this.isSavingAndExit = true;
    if (this.valid()) {
      this.saveSucess();
    }
  }

  saveSucess() {
    if (this.isSavingAndNext) {
      this.portalItemService.saveCurrentStep('search');
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
          if (!tables.find(x => x.value === selectedDbTable)) {
            this.formControlDbTable.setValue(tables[0].value);
          } else {
            this.formControlDbTable.setValue(selectedDbTable);
          }
        }

        this.getDbTableColumns();
      });
  }

  /* db connection dialog */
  connectionSaved(item: { label: string; value: string }) {
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
    this.formControlDbTable.setValue(this.dbTables[0].value);

    this.getDbTableColumns();
  }
}

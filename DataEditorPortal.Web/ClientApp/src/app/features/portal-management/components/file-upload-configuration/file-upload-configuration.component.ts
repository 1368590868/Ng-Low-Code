import {
  CUSTOM_ELEMENTS_SCHEMA,
  ChangeDetectionStrategy,
  Component,
  Input,
  OnInit,
  ViewChildren,
  forwardRef
} from '@angular/core';
import {
  ControlValueAccessor,
  FormControl,
  NG_VALUE_ACCESSOR,
  NgModel
} from '@angular/forms';
import { FieldType, FieldTypeConfig, FormlyFieldProps } from '@ngx-formly/core';
import {
  DataSourceConnection,
  DataSourceTable,
  DataSourceTableColumn
} from '../../models/portal-item';
import { PortalItemService } from '../../services/portal-item.service';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-file-upload-configuration',
  templateUrl: './file-upload-configuration.component.html',
  styleUrls: ['./file-upload-configuration.component.scss'],
  providers: [
    {
      provide: CUSTOM_ELEMENTS_SCHEMA,
      useExisting: FileUploadConfigurationComponent,
      multi: true
    },
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => FileUploadConfigurationComponent),
      multi: true
    }
  ]
})
export class FileUploadConfigurationComponent
  implements ControlValueAccessor, OnInit
{
  @ViewChildren('dropdownList') dropdownList!: NgModel[];
  @Input() foreignKeyOptions!: { label: string; value: string }[];
  visible = false;
  isLoading = false;
  innerValue: any = null;

  onChange?: any;
  onTouch?: any;
  disabled = false;

  dbConnections: { label: string; value: string }[] = [];
  dsConfig: {
    queryText?: string;
    idColumn?: string;
    dataSourceConnectionId: string;
    tableName: string;
    tableSchema: string;
    fileStorageType: string;
    basePath?: string;
    fieldMapping?: {
      [key: string]: string | null;
    };
  } = {
    idColumn: undefined,
    dataSourceConnectionId: '',
    tableName: '',
    tableSchema: '',
    fileStorageType: '',
    fieldMapping: undefined
  };
  isStorageTypeBinary = false;
  dbTables: DataSourceTable[] = [];
  dbTableColumns: DataSourceTableColumn[] = [];
  formControlConnection: FormControl = new FormControl();
  formControlDbTable: FormControl = new FormControl();

  idColumn: null | string = null;
  contentTypeColumn: null | string = null;
  statusColumn: null | string = null;
  fileNameColumn: null | string = null;
  storageTypeColumn: null | string = null;
  referenceDataKeyColumn: null | string = null;
  basePathColumn: null | string = null;
  commentsColumn: null | string = null;
  foreignKeyColumn: null | string = null;
  filePathColumn: null | string = null;
  fileBytesColumn: null | string = null;

  createdDateColumn: null | string = null;
  createdByColumn: null | string = null;
  modifiedDateColumn: null | string = null;
  modifiedByColumn: null | string = null;

  @Input()
  set value(val: any) {
    if (!val) {
      this.onReset();
      this.dsConfig.fieldMapping = undefined;
    }
    this.innerValue = val;

    const newVal = JSON.parse(JSON.stringify(val || null));
    if (newVal) {
      this.dsConfig = newVal;
      this.idColumn = newVal.fieldMapping.ID;
      this.contentTypeColumn = newVal.fieldMapping.CONTENT_TYPE;
      this.statusColumn = newVal.fieldMapping.STATUS;
      this.fileNameColumn = newVal.fieldMapping.FILE_NAME;
      this.storageTypeColumn = newVal.fileStorageType;
      this.referenceDataKeyColumn = newVal.referenceDataKeyColumn;
      this.commentsColumn = newVal.fieldMapping.COMMENTS;
      this.foreignKeyColumn = newVal.fieldMapping.FOREIGN_KEY;
      this.filePathColumn = newVal.fieldMapping.FILE_PATH;
      this.fileBytesColumn = newVal.fieldMapping.FILE_BYTES;
      this.basePathColumn = newVal.basePath;

      this.createdDateColumn = newVal.fieldMapping?.CREATED_DATE;
      this.createdByColumn = newVal.fieldMapping?.CREATED_BY;
      this.modifiedDateColumn = newVal.fieldMapping?.MODIFIED_DATE;
      this.modifiedByColumn = newVal.fieldMapping?.MODIFIED_BY;

      this.formControlConnection.setValue(newVal.dataSourceConnectionId);
      this.formControlDbTable.setValue(
        `${this.dsConfig.tableSchema}.${this.dsConfig.tableName}`
      );

      this.onStorageTypeChange(this.storageTypeColumn || '');
    }
  }

  writeValue(value: any): void {
    this.value = value;
  }
  registerOnChange(fn: any): void {
    this.onChange = fn;
  }
  registerOnTouched(fn: any): void {
    this.onTouch = fn;
  }
  setDisabledState?(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  constructor(private portalItemService: PortalItemService) {}

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
    this.formControlConnection.valueChanges.subscribe(value => {
      this.dsConfig.dataSourceConnectionId = value;
    });
    // get protal item datasource config
    if (this.portalItemService.itemId) {
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

        // check if current selected connections exists, if not exist, use the first
        if (
          !connections.find(x => x.id === this.dsConfig.dataSourceConnectionId)
        ) {
          this.formControlConnection.setValue(connections[0].id);
        } else {
          this.formControlConnection.setValue(
            this.dsConfig.dataSourceConnectionId
          );
        }

        this.getDbTables();
      });

      this.portalItemService.saveCurrentStep('datasource');
    }
  }

  onStorageTypeChange(value: string) {
    value === 'SqlBinary'
      ? (this.isStorageTypeBinary = true)
      : (this.isStorageTypeBinary = false);
  }

  showDialog() {
    this.visible = true;
    if (this.innerValue) {
      this.value = this.innerValue;
    }
  }

  onCancel() {
    this.visible = false;
  }

  onReset() {
    this.idColumn = null;
    this.contentTypeColumn = null;
    this.statusColumn = null;
    this.fileNameColumn = null;
    this.storageTypeColumn = null;
    this.commentsColumn = null;
    this.referenceDataKeyColumn = null;
    this.filePathColumn = null;
    this.fileBytesColumn = null;
    this.foreignKeyColumn = null;
    this.createdByColumn = null;
    this.createdDateColumn = null;
    this.modifiedByColumn = null;
    this.modifiedDateColumn = null;
    this.basePathColumn = null;
  }

  removeConfig() {
    this.onReset();
    this.dsConfig.fieldMapping = undefined;
    this.innerValue = null;
    this.onChange?.(null);
  }

  onOk() {
    this.dropdownList.forEach(x => {
      x.control.markAsDirty();
    });
    if (this.valid()) {
      if (this.storageTypeColumn === 'SqlBinary') {
        if (this.fileBytesColumn == null) {
          return;
        }
      }
      this.dsConfig.fileStorageType = this.storageTypeColumn || '';
      this.dsConfig.basePath = this.basePathColumn || '';
      this.dsConfig.fieldMapping = {
        ID: this.idColumn,
        CONTENT_TYPE: this.contentTypeColumn,
        STATUS: this.statusColumn,
        FILE_NAME: this.fileNameColumn,
        COMMENTS: this.commentsColumn,
        FILE_PATH: this.filePathColumn,
        FILE_BYTES: this.fileBytesColumn,
        CREATED_DATE: this.createdDateColumn,
        CREATED_BY: this.createdByColumn,
        MODIFIED_DATE: this.modifiedDateColumn,
        MODIFIED_BY: this.modifiedByColumn,
        REFERENCE_DATA_KEY: this.referenceDataKeyColumn,
        FOREIGN_KEY: this.foreignKeyColumn
      };
      this.innerValue = this.dsConfig;
      this.onChange?.(this.dsConfig);
      this.visible = false;
    }
  }

  onHide() {
    if (!this.innerValue) {
      this.onReset();
    }

    this.dropdownList.forEach(x => {
      x.control.markAsPristine();
    });
  }

  valid() {
    if (
      this.dsConfig.dataSourceConnectionId == null ||
      this.idColumn == null ||
      this.statusColumn == null ||
      this.storageTypeColumn == null ||
      this.foreignKeyColumn == null ||
      this.referenceDataKeyColumn == null
    ) {
      return false;
    }
    return true;
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

        const selectedDbTable = `${this.dsConfig.tableSchema}.${this.dsConfig.tableName}`;

        // check if current selected dbTable exists, if not exist, use the first
        if (!tables.find(x => x.value === selectedDbTable)) {
          this.formControlDbTable.setValue(tables[0].value);
        } else {
          this.formControlDbTable.setValue(selectedDbTable);
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
  }

  getDbTableColumns() {
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

@Component({
  selector: 'app-formly-file-upload-configuration',
  template: ` <app-file-upload-configuration
    [formControl]="formControl"
    [formlyAttributes]="field"
    [foreignKeyOptions]="
      props.foreignKeyOptions || []
    "></app-file-upload-configuration>`,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FormlyFieldFileUploadConfigurationComponent extends FieldType<
  FieldTypeConfig<
    FormlyFieldProps & {
      foreignKeyOptions: { label: string; value: string }[];
    }
  >
> {}

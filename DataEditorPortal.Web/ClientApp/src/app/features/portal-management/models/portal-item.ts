export interface PortalItem {
  data?: PortalItemData;
  children?: PortalItem[];
  expanded?: boolean;
}

export interface PortalItemData {
  [name: string]: any;
}

export interface DataSourceConnection {
  name: string;
  id?: string;
  connectionString: string;
}

export interface DataSourceTable {
  tableName: string;
  tableSchema: string;
  label?: string;
  value?: string;
}

export interface DataSourceTableColumn {
  columnName: string;
  filterType: string;
  isKey: boolean;
  isUnique: boolean;
  isAutoIncrement: boolean;
  isIdentity: boolean;
  allowDBNull: boolean;
}

export interface DataSourceConfig {
  dataSourceConnectionId: string;
  tableName?: string;
  tableSchema?: string;
  idColumn: string;
  filters?: DataSourceFilter[];
  sortBy?: DataSourceSortBy[];
  queryText?: string;
  pageSize?: number;
  autoAddDatabase?: { type: string; queryText: string };
}

export interface DataSourceFilter {
  field?: string;
  filterType?: string;
  matchMode?: string;
  value?: string;
}

export interface DataSourceSortBy {
  field?: string;
  order?: number;
}

export interface GridColumn {
  type?: string;
  field?: string;
  header?: string;
  width?: string;
  filterType?: string;
  uiType?: string;
  order?: number;
  aggregate?: boolean;
  selected?: boolean;
  template?: string;
  format?: string;
}

export interface GridSearchField {
  key: string;
  type: string;
  props: { [name: string]: any };
  selected?: boolean;
  searchRule: {
    field: string;
    matchMode?: string;
    whereClause?: string;
  };
  filterType: string;
}

export interface GridFormField {
  key: string;
  type: string;
  defaultValue?: any;
  props: { [name: string]: any };
  selected?: boolean;
  filterType: string;
}

export interface GirdDetailConfig {
  addingForm?: GridFormConfig;
  updatingForm?: GridFormConfig;
  deletingForm?: GridFormConfig;
  infoForm?: GridFormConfig;
}

export interface GridEventConfig {
  eventType: string;
  script: string;
}

export interface GridFormConfig {
  sameAsAdd?: boolean;
  useCustomForm?: boolean;
  customFormName?: string;
  formFields?: GridFormField[];
  queryText?: string;
  onValidate?: GridEventConfig;
  afterSaved?: GridEventConfig;
}

export interface GridCustomAction {
  name?: string;
}

export interface LinkedTableConfig {
  id?: string;
  columnsForLinkedField?: string[];
  mapToLinkedTableField?: string;
}

export interface LinkedDataSourceConfig {
  primaryTable?: LinkedTableConfig | null;
  secondaryTable?: LinkedTableConfig | null;
  linkedTable?: DataSourceConfig;
}

export interface LinkedSingleConfigDetails {
  id?: string;
  name?: string;
  status?: number;
  itemType?: string;
  description: string | null;
  configCompleted?: boolean;
}

export interface LinkedSingleConfig {
  columns: string[];
  details: LinkedSingleConfigDetails[];
  idColumn?: string;
}

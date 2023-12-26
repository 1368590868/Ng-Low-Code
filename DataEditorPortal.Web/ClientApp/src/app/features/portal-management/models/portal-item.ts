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
  dataSourceConnectionName: string;
  tableName?: string;
  tableSchema?: string;
  idColumn?: string;
  filters?: DataSourceFilter[];
  sortBy?: DataSourceSortBy[];
  queryText?: string;
  pageSize?: number;
  primaryForeignKey?: string;
  primaryReferenceKey?: string;
  secondaryForeignKey?: string;
  secondaryReferenceKey?: string;
  queryInsert?: string;
  isOneToMany?: boolean;
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
  type: string;
  field: string;
  header: string;
  width: number;
  filterType: string;
  order?: number;
  selected: boolean;
  template?: string;
  format?: string;
  sortable: boolean;
  filterable: boolean;
  enumFilterValue?: boolean;
}

export interface GridSearchConfig {
  searchFields: GridSearchField[];
  useExistingSearch: boolean;
  existingSearchId: string;
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
  enabled?: boolean;
  useAddingFormLayout?: boolean;
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
  linkTable?: DataSourceConfig | null;
  useAsMasterDetailView?: boolean;
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
  gridColumns: { label: string; value: string }[];
  databaseColumns?: { label: string; value: string }[];
  details: LinkedSingleConfigDetails[];
  idColumn?: string;
}

export interface ImportPortal {
  key: string;
  displayName: string;
  type: string;
  exist: boolean;
}

export interface FieldControlType {
  label: string;
  value: string;
  filterType: string;
  hideValidatorConfig?: boolean;
  hideExpressionConfig?: boolean;
  hideComputedConfig?: boolean;
  hidePlaceholderConfig?: boolean;
  isCustom?: boolean;
  initialConfig?: {
    [key: string]: any;
  };
}

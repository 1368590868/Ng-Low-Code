export interface PortalItem {
  data?: PortalItemData;
  children?: PortalItem[];
  expanded?: boolean;
}

export interface PortalItemData {
  [name: string]: any;
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
  tableName?: string;
  tableSchema?: string;
  idColumn?: string;
  filters?: DataSourceFilter[];
  sortBy?: DataSourceSortBy[];
  queryText?: string;
}

export interface DataSourceFilter {
  field?: string;
  filterType?: string;
  matchMode?: string;
  value?: string;
}

export interface DataSourceSortBy {
  field?: string;
  order?: string;
}

export interface GridColumn {
  field?: string;
  header?: string;
  width?: string;
  filterType?: string;
  uiType?: string;
  order?: number;
  aggregate?: boolean;
  selected?: boolean;
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

export interface GridFormConfig {
  allowEdit?: boolean;
  allowDelete?: boolean;
  allowExport?: boolean;
  useCustomForm?: boolean;
  customAddFormName?: string;
  customEditFormName?: string;
  customViewFormName?: string;
  formFields?: GridFormField[];
}

export interface GridCustomAction {
  name?: string;
}

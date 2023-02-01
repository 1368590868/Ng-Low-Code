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
}

export interface DataSourceConfig {
  tableName: string;
  tableSchema: string;
  idColumn: string;
  filters: DataSourceFilter[];
  sortBy: DataSourceSortBy[];
}

export interface DataSourceFilter {
  field?: string;
  filterType?: string;
  matchOptions?: any[];
  matchMode?: string;
  value?: string;
  errValue?: boolean;
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
  props: { [name: string]: string };
  selected?: boolean;
  searchRule: {
    field: string;
    matchMode?: string;
  };
  filterType: string;
}

export interface GridFormField {
  key: string;
  type: string;
  defaultValue?: any;
  props: { [name: string]: string };
  selected?: boolean;
  filterType: string;
}

export interface GridFormConfig {
  allowEdit?: boolean;
  allowDelete?: boolean;
  allowExport?: boolean;
  useCustomAction?: boolean;
  customActionName?: string;
  formFields?: GridFormField[];
}

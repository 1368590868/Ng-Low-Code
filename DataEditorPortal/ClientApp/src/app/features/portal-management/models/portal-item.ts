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
}

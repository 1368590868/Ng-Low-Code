import { SortMeta, FilterMetadata } from 'primeng/api';

export interface GridParam {
  filters: GridFilterParam[];
  sorts: SortMeta[];
  searches?: SearchParam;
  startIndex: number;
  indexCount: number;
}

export interface SearchParam {
  [name: string]: string;
}

export interface GridFilterParam extends FilterMetadata {
  field: string;
}

export interface GridResult {
  total: number;
  errormessage: string;
  data: GridData[];
}

export interface GridData {
  [name: string]: string;
}

export interface GridConfig {
  name?: string;
  caption?: string;
  description?: string;
  dataKey: string;
}

export interface GridColumn {
  field?: string;
  header?: string;
  width?: string;
  filterType?: string;
  uiType?: string;
  order?: number;
  aggregate: boolean;
}

export interface GridSearchConfig {
  key: string;
  type: string;
  props: { [name: string]: string };
  dependOnFields?: string;
}

import { SortMeta, FilterMetadata } from 'primeng/api';
import { GridActionOption } from '../../universal-grid-action/universal-grid-action.module';

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
  customEditFormName?: string;
  customAddFormName?: string;
  customViewFormName?: string;
  customActions?: GridActionOption[];
  pageSize?: number;
}

export interface GridColumn {
  field?: string;
  header?: string;
  width?: string;
  filterType?: string;
  uiType?: string;
  order?: number;
  aggregate: boolean;
  template?: string;
  format?: string;
  filterOptions?: any[];
}

export interface GridSearchConfig {
  key: string;
  type: string;
  props: { [name: string]: string };
}

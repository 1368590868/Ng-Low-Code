import { GridActionOption } from '../../universal-grid-action/universal-grid-action.module';

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
  customDeleteFormName?: string;
  customActions?: GridActionOption[];
  pageSize?: number;
  helpUrl?: string;
  allowAdding?: boolean;
  allowEditing?: boolean;
  allowDeleting?: boolean;
}

export interface GridColumn {
  field: string;
  header: string;
  width: number;
  filterType: string;
  order?: number;
  template?: string;
  format?: string;
  filterOptions?: any[];
  sortable: boolean;
  filterable: boolean;
  enumFilterValue?: boolean;
}

export interface GridSearchConfig {
  key: string;
  type: string;
  props: { [name: string]: string };
}

export interface LinkedGridConfig {
  primaryTableName: string;
  secondaryTableName: string;
  useAsMasterDetailView: boolean;
}

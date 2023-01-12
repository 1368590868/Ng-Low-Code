import { SortMeta, FilterMetadata } from 'primeng/api';

export interface ExportForm {
  fileName: string;
  exportOption: string;
}

export interface ExportParam {
  fileName: string;
  selectedIds: string[];
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

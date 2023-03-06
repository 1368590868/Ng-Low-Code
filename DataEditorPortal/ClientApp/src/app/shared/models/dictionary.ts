import { FilterMetadata, SortMeta } from 'primeng/api';

export interface DictionaryData {
  Id?: string;
  Label?: string;
  Value?: string;
  Value1?: string;
  Value2?: string;
  Category?: string;
}

export interface DictionaryResult {
  data: DictionaryData[];
  total: number;
}

export interface GridFilterParam extends FilterMetadata {
  field: string;
}
export interface SearchParam {
  [name: string]: string;
}

export interface GridParam {
  filters: GridFilterParam[];
  sorts: SortMeta[];
  searches?: SearchParam;
  startIndex: number;
  indexCount: number;
}
export interface PaginationEvent {
  page?: number;
  first: number;
  rows: number;
  pageCount?: number;
}

export interface SortMetaEvent {
  field: string;
  order: number;
}

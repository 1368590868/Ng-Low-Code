import { FilterMetadata, SortMeta } from 'primeng/api';

export interface SearchParam {
  [name: string]: string;
}

export interface GridFilterParam extends FilterMetadata {
  field: string;
}

export interface PaginationEvent {
  page?: number;
  first: number;
  rows: number;
  pageCount?: number;
}

export interface GridParam {
  filters: GridFilterParam[];
  sorts: SortMeta[];
  searches?: SearchParam;
  startIndex: number;
  indexCount: number;
}

export interface SortMetaEvent {
  field: string;
  order: number;
}

export interface GridProp {
  Id: string;
  EventTime?: string;
  EventSection?: string;
  Category?: string;
  EventName?: string;
  UserName?: string;
  Details?: string;
  Params?: string;
  Result?: string;
}

export interface GridResult {
  data: GridProp[];
  total: number;
}

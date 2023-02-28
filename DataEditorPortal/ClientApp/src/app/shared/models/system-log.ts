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

export interface GridProp {
  id: string;
  EventTime?: string;
  EventSection?: string;
  Category?: string;
  EventName?: string;
  UserName?: string;
  Details?: string;
  Params?: string;
  Result?: string;
}

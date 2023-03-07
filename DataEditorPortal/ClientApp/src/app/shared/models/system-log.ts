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

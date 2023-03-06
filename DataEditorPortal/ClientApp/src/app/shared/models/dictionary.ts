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

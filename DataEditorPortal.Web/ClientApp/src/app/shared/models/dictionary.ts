export interface DictionaryData {
  ID?: string;
  LABEL?: string;
  VALUE?: string;
  VALUE1?: string;
  VALUE2?: string;
  CATEGORY?: string;
}

export interface DictionaryResult {
  data: DictionaryData[];
  total: number;
}

export interface GroupData {
  NAME?: string;
  DESCRIPTION?: string;
  ID?: string;
}

export interface GroupDetail {
  name?: string;
  description?: string;
  id?: string;
  aboutPageContent?: string;
  contactPageContent?: string;
}

export interface DictionaryResult {
  data: GroupData[];
  total: number;
}

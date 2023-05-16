interface Errors {
  field: string;
  errorMsg: string;
}

export interface InfoData {
  status: number;
  errors: Errors[];
  [key: string]: string | number | Errors[];
}
export interface InfoList {
  data?: InfoData[];
}

export interface LoadState {
  hasLoad: boolean;
}

export interface ImportHistories {
  id?: string;
  name?: string;
  status?: string;
  result?: string;
  createByUser?: string;
  createDate?: string;
  progress?: number;
}

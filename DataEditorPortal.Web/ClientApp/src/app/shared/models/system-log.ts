export interface SystemLogData {
  ID: string;
  EVENT_TIME?: string;
  EVENT_SECTION?: string;
  CATEGORY?: string;
  EVENT_NAME?: string;
  USERNAME?: string;
  DETAILS?: string;
  PARAMS?: string;
  RESULT?: string;
}

export interface GridResult {
  data: SystemLogData[];
  total: number;
}

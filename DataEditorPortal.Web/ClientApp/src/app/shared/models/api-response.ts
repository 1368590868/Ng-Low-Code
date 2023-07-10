export interface ApiResponse<T> {
  responseException?: {
    exceptionMessage: string;
  };
  code: number;
  data?: T;
  message?: string;
}

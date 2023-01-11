export interface ApiResponse<T> {
  isError: boolean;
  responseException?: {
    exceptionMessage: string;
  };
  result?: T;
  message?: string;
}

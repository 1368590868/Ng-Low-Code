export interface UserManagerForm {
  firstName?: string;
  email?: string;
  phone?: string;
  vendor?: string[];
}

export interface UserManagerResponse {
  isError?: boolean;
  result?: string;
}

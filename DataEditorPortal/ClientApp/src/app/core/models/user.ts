interface UserPermissions {
  [propName: string]: boolean;
}

export interface AppUser {
  id?: string;
  identityName?: string;
  username?: string;
  domain?: string;
  displayName?: string;
  email?: string;
  vendor?: string;
  authenticated?: boolean;
  permissions?: UserPermissions;
}

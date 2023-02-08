interface UserPermissions {
  [propName: string]: boolean;
}

export interface AppUser {
  identityName?: string;
  username?: string;
  domain?: string;
  displayName?: string;
  email?: string;
  vendor?: string;
  authenticated?: boolean;
  permissions?: UserPermissions;

  picture?: string;
  siteTitle?: string;
}

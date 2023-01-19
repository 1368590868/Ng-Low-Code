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

export interface ManageRoleForm {
  id?: string;
  username?: string;
  employer?: string;
  comments?: string;
  division?: any;
  name?: string;
  email?: string;
  vendor?: string;
  autoEmail?: boolean;
  userType?: string;
  phone?: string;
}

export interface updateRole {
  roleId?: string;
}

export interface UserPemissions {
  id?: string;
  selected?: boolean;
  permissionName?: string;
  permissionDescription?: string;
  category?: string;
}

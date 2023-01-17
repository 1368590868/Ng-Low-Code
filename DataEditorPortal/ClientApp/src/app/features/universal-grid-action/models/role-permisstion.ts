export interface Role {
  checked: boolean;
  label: string;
  value: string;
  key: string;
}

export interface Permisstion {
  id?: number;
  name?: string;
  desc?: string;
}

export interface RoleList {
  id?: string;
  roleName?: string;
  roleDescription?: string;
}

export interface RolePermissions {
  id?: string;
  selected?: boolean;
  permissionName?: string;
  permissionDescription?: string;
  category?: string;
}

export interface ManageRoleForm {
  roleId?: string;
  roleName?: string;
  oldRoleName?: string;
  roleDescription?: string;
  permissions?: RolePermissions[];
}

export interface updateRole {
  roleId?: string;
}

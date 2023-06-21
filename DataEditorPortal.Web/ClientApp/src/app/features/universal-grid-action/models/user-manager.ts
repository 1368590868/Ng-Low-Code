export interface ManageRoleForm {
  id?: string;
  username?: string;
  comments?: string;
  name?: string;
  email?: string;
  autoEmail?: boolean;
  userType?: string;
  phone?: string;
}

export interface UpdateRole {
  roleId?: string;
}

export interface UserPemissions {
  id?: string;
  selected?: boolean;
  permissionName?: string;
  permissionDescription?: string;
  category?: string;
}

export interface UserData extends UserPemissions {
  label?: string;
  roleName?: string;
  selected?: boolean;
}

export interface RoleItem {
  id?: string;
  roleDescription?: string;
  roleName?: string;
  selected?: boolean;
}

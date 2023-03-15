import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { TreeNode } from 'primeng/api';
import { map, Observable } from 'rxjs';
import { ApiResponse } from 'src/app/shared';
import {
  Role,
  Permisstion,
  updateRole,
  ManageRoleForm,
  RoleItem
} from '../models/role-permisstion';

@Injectable({
  providedIn: 'root'
})
export class RolePermissionService {
  public _apiUrl: string;
  public currentPortalItem = 'usermanagement';
  constructor(private http: HttpClient, @Inject('API_URL') apiUrl: string) {
    this._apiUrl = apiUrl;
  }

  getRoleList() {
    return this.http
      .get<ApiResponse<RoleItem[]>>(`${this._apiUrl}role/list`)
      .pipe(map(res => res.result || []));
  }

  getRolePermissions(roleId: string) {
    return this.http
      .get<ApiResponse<TreeNode[]>>(`${this._apiUrl}role/${roleId}/permissions`)
      .pipe(map(res => res.result || []));
  }

  getSitePermissions() {
    return this.http
      .get<ApiResponse<TreeNode[]>>(`${this._apiUrl}role/all-site-permissions`)
      .pipe(map(res => res.result || []));
  }

  updateRole(data: ManageRoleForm) {
    return this.http.post<ApiResponse<updateRole[]>>(
      `${this._apiUrl}role/${data.roleId}/update`,
      data
    );
  }

  createRole(data: ManageRoleForm) {
    return this.http.put<ApiResponse<updateRole[]>>(
      `${this._apiUrl}role/create`,
      data
    );
  }
}

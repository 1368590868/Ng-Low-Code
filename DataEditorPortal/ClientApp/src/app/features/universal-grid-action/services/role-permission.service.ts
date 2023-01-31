import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { ApiResponse } from 'src/app/core';
import {
  Role,
  Permisstion,
  RoleList,
  RolePermissions,
  updateRole,
  ManageRoleForm
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

  getRoles(): Observable<Role[]> {
    return this.http
      .get<ApiResponse<Role[]>>(
        `${this._apiUrl}UniversalGrid/${this.currentPortalItem}/config/detail`
      )
      .pipe(map(res => res.result || []));
  }

  saveRoles(roles: Role[]): Observable<ApiResponse<Role[]>> {
    return this.http.post<ApiResponse<Role[]>>(
      `${this._apiUrl}UniversalGrid/${this.currentPortalItem}/config/detail`,
      roles
    );
  }

  getPermissions(): Observable<Permisstion[]> {
    return this.http
      .get<ApiResponse<Permisstion[]>>(
        `${this._apiUrl}UniversalGrid/${this.currentPortalItem}/config/detail`
      )
      .pipe(map(res => res.result || []));
  }

  savePermissions(permissions: Permisstion[]) {
    return this.http.post<ApiResponse<Permisstion[]>>(
      `${this._apiUrl}UniversalGrid/${this.currentPortalItem}/config/detail`,
      permissions
    );
  }

  getRoleList() {
    return this.http
      .get<ApiResponse<RoleList[]>>(`${this._apiUrl}role/list`)
      .pipe(map(res => res.result || []));
  }

  getRolePermissions(roleId: string) {
    return this.http
      .get<ApiResponse<RolePermissions[]>>(
        `${this._apiUrl}role/${roleId}/permissions`
      )
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

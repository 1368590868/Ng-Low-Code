import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { ApiResponse } from 'src/app/shared';
import {
  ManageRoleForm,
  UpdateRole,
  UserData,
  UserPemissions
} from '../models/user-manager';

@Injectable({
  providedIn: 'root'
})
export class UserManagerService {
  public _apiUrl: string;
  public section = 'user-management';
  constructor(private http: HttpClient, @Inject('API_URL') apiUrl: string) {
    this._apiUrl = apiUrl;
  }

  createUser(data: ManageRoleForm) {
    return this.http.post<ApiResponse<UpdateRole[]>>(
      `${this._apiUrl}user/create`,
      data
    );
  }

  getUserDetail(id: string): Observable<ManageRoleForm> {
    return this.http
      .get<ApiResponse<ManageRoleForm>>(`${this._apiUrl}user/detail/${id}`)
      .pipe(map(res => res.result || {}));
  }

  updateUser(data: ManageRoleForm) {
    return this.http.put<ApiResponse<UpdateRole[]>>(
      `${this._apiUrl}user/update/${data.id}`,
      data
    );
  }

  getUserPermissions(id: string) {
    return this.http
      .get<ApiResponse<UserData[]>>(`${this._apiUrl}user/${id}/permissions`)
      .pipe(map(res => res.result || []));
  }
  getUserRole(id: string) {
    return this.http
      .get<ApiResponse<UserData[]>>(`${this._apiUrl}user/${id}/roles`)
      .pipe(map(res => res.result || []));
  }

  saveUserRole(data: UserData[], id: string) {
    return this.http.post<ApiResponse<string>>(
      `${this._apiUrl}user/${id}/roles`,
      { permissions: data }
    );
  }

  saveUserPermissions(data: UserPemissions[], id: string) {
    return this.http.post<ApiResponse<string>>(
      `${this._apiUrl}user/${id}/permissions`,
      { permissions: data }
    );
  }
}

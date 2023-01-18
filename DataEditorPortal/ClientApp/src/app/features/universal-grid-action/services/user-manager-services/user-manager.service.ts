import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { ApiResponse } from 'src/app/core/models/api-response';
import {
  ManageRoleForm,
  updateRole,
  UserPemissions
} from '../../models/user-manager';
import {
  UserManagerForm,
  UserManagerResponse
} from '../../models/user-manager';

@Injectable({
  providedIn: 'root'
})
export class UserManagerService {
  public _apiUrl: string;
  constructor(private http: HttpClient, @Inject('API_URL') apiUrl: string) {
    this._apiUrl = apiUrl;
  }

  saveUserManager(formData: UserManagerForm): Observable<UserManagerResponse> {
    return this.http.post(
      `${this._apiUrl}UniversalGrid/usermanagement/config/columns`,
      formData
    );
  }

  createUser(data: ManageRoleForm) {
    return this.http.put<ApiResponse<updateRole[]>>(
      `${this._apiUrl}user/create`,
      { ...data, division: JSON.stringify(data.division) }
    );
  }

  getUserDetail(id: string): Observable<ManageRoleForm> {
    return this.http
      .get<ApiResponse<ManageRoleForm>>(`${this._apiUrl}user/detail/${id}`)
      .pipe(map(res => res.result || {}));
  }

  updateUser(data: ManageRoleForm) {
    return this.http.put<ApiResponse<updateRole[]>>(
      `${this._apiUrl}user/update/${data.id}`,
      { ...data, division: JSON.stringify(data.division) }
    );
  }

  getUserPermissions(id: string) {
    return this.http
      .get<ApiResponse<UserPemissions>>(`${this._apiUrl}user/${id}/permissions`)
      .pipe(map(res => res.result));
  }
}

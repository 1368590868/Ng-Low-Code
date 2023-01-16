import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { ApiResponse } from 'src/app/core/models/api-response';
import { Role, Permisstion } from '../../models/role-permisstion';

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
}

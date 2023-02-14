import { HttpClient, HttpParams } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { map, Observable, tap } from 'rxjs';
import {
  ManageRoleForm,
  UpdateRole
} from 'src/app/features/universal-grid-action/models/user-manager';
import { ApiResponse } from '../models/api-response';
import { AppUser } from '../models/user';
import { ConfigDataService } from './config-data.service';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  public _apiUrl: string;
  public USER: AppUser = {};
  public isLogin = false;
  public durationMs = 5000;

  constructor(
    private http: HttpClient,
    @Inject('API_URL') apiUrl: string,
    private configData: ConfigDataService
  ) {
    this._apiUrl = apiUrl;
  }

  login() {
    return this.getLoggedInUser().pipe(
      tap(res => {
        if (!res.isError && res.result) {
          this.isLogin = true;
          this.loginAfter();
          this.USER = res.result;
        }
      })
    );
  }

  loginAfter() {
    this.configData.getSiteEnvironment().subscribe();
    this.configData.menuChange$.next(null);
  }

  getLoggedInUser() {
    return this.http.get<ApiResponse<AppUser>>(
      `${this._apiUrl}User/GetLoggedInUser`
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
      { ...data, division: JSON.stringify(data.division) }
    );
  }

  userNameExists(name: string, id?: string): Observable<ApiResponse<boolean>> {
    let params = new HttpParams().set('username', name);
    if (id) params = params.set('id', id);
    return this.http.get<ApiResponse<boolean>>(
      `${this._apiUrl}user/username-exists`,
      {
        params
      }
    );
  }

  emailExists(email: string, id?: string): Observable<ApiResponse<boolean>> {
    let params = new HttpParams().set('email', email);
    if (id) params = params.set('id', id);
    return this.http.get<ApiResponse<boolean>>(
      `${this._apiUrl}user/email-exists`,
      {
        params
      }
    );
  }
}

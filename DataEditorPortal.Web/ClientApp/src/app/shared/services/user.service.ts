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

  login(url?: string) {
    return this.getLoggedInUser(url).pipe(
      tap(res => {
        if (res.code == 200 && res.data) {
          this.isLogin = true;
          this.configData.isLogin = true;
          this.USER = res.data;

          // set site group
          const menus = res.data.userMenus;
          if (menus) {
            const siteGroup = menus.find(m => m.type === 'Group');
            if (siteGroup) this.configData.siteGroupName = siteGroup.name;
          }

          // trigger load menus
          this.configData.menuChange$.next(null);

          // load site env
          this.configData.getSiteEnvironment().subscribe();
        }
      })
    );
  }

  getLoggedInUser(url?: string) {
    return this.http.get<ApiResponse<AppUser>>(
      `${this._apiUrl}User/GetLoggedInUser`,
      { params: { url: url || '' } }
    );
  }

  getUserDetail(id: string): Observable<ManageRoleForm> {
    return this.http
      .get<ApiResponse<ManageRoleForm>>(`${this._apiUrl}user/detail/${id}`)
      .pipe(map(res => res.data || {}));
  }

  updateUser(data: ManageRoleForm) {
    return this.http.put<ApiResponse<UpdateRole[]>>(
      `${this._apiUrl}user/update/${data.id}`,
      data
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

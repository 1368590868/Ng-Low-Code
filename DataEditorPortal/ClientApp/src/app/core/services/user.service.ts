import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { tap } from 'rxjs';
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
}

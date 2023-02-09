import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { tap } from 'rxjs';
import { ApiResponse } from '../models/api-response';
import { AppUser } from '../models/user';
import { ConfigDataService } from './config-data.service';
import { SiteSettingsService } from './site-settings.service';

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
    private configData: ConfigDataService,
    private siteSettings: SiteSettingsService
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
    this.siteSettings.getSiteSettings().subscribe();
    this.configData.menuChange$.next(null);
  }

  getLoggedInUser() {
    return this.http.get<ApiResponse<AppUser>>(
      `${this._apiUrl}User/GetLoggedInUser`
    );
  }
}

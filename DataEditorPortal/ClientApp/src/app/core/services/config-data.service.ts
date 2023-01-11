import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { map, Observable, of } from 'rxjs';
import { ApiResponse } from '../models/api-response';

@Injectable({
  providedIn: 'root'
})
export class ConfigDataService {
  public _apiUrl: string;
  public durationMs = 5000;
  constructor(private http: HttpClient, @Inject('API_URL') apiUrl: string) {
    this._apiUrl = apiUrl;
  }

  getSiteVersion() {
    return this.http.get(this._apiUrl + 'site/version');
  }

  getSiteEnvironment() {
    return this.http.get(`${this._apiUrl}site/environment`);
  }

  getLoggedInUser() {
    return this.http.get(`${this._apiUrl}User/GetLoggedInUser`);
  }

  getSiteMenus(): Observable<any> {
    return this.http
      .post<ApiResponse<any>>(`${this._apiUrl}site/menus`, null)
      .pipe(map(res => res.result));
  }
}

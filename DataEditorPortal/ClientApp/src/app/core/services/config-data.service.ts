import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { map, Observable, of, Subject, tap } from 'rxjs';
import { ApiResponse } from '../models/api-response';

interface HeaderText {
  webHeaderDescription: string;
  webHeaderMessage: string;
}

@Injectable({
  providedIn: 'root'
})
export class ConfigDataService {
  public _apiUrl: string;
  public durationMs = 5000;
  public headerText: HeaderText = {
    webHeaderDescription: '',
    webHeaderMessage: ''
  };

  public menuChange$ = new Subject();

  constructor(private http: HttpClient, @Inject('API_URL') apiUrl: string) {
    this._apiUrl = apiUrl;
  }

  getSiteVersion() {
    return this.http.get(this._apiUrl + 'site/version');
  }

  getSiteEnvironment() {
    return this.http
      .get<{
        result: HeaderText;
      }>(`${this._apiUrl}site/environment`)
      .pipe(
        tap(res => {
          this.headerText = res.result;
        })
      );
  }

  getLoggedInUser() {
    return this.http.get(`${this._apiUrl}User/GetLoggedInUser`);
  }

  getSiteMenus(): Observable<any> {
    return this.http
      .post<ApiResponse<any>>(`${this._apiUrl}site/menus`, null)
      .pipe(map(res => res.result));
  }
  getHomeMenus(): Observable<any> {
    return this.http
      .post<ApiResponse<any>>(`${this._apiUrl}site/menus`, null)
      .pipe(map(res => res.result));
  }
}

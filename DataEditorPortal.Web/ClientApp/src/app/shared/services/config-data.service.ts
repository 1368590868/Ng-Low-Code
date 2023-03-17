import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { map, Observable, of, Subject, tap } from 'rxjs';
import { ApiResponse } from '../models/api-response';
import { SiteMenu } from '../models/menu';

interface HeaderText {
  webHeaderDescription: string;
  webHeaderMessage: string;
}

interface SettingsDocument {
  html: string;
  pageName: string;
}

export interface SiteSettings {
  siteLogo?: string;
  siteName: string;
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
      }>(`${this._apiUrl}site/settings`)
      .pipe(
        tap(res => {
          this.headerText = res.result;
        })
      );
  }

  getSiteMenus(): Observable<SiteMenu[]> {
    return this.http
      .post<ApiResponse<SiteMenu[]>>(`${this._apiUrl}site/menus`, null)
      .pipe(map(res => res.result || []));
  }

  getHomeMenus(): Observable<SiteMenu[]> {
    return this.http
      .post<ApiResponse<SiteMenu[]>>(`${this._apiUrl}site/menus`, null)
      .pipe(map(res => res.result || []));
  }

  public siteSettings: SiteSettings = {
    siteLogo: '',
    siteName: ''
  };

  getSiteSettings() {
    return this.http
      .get<ApiResponse<SiteSettings>>(`${this._apiUrl}site/settings`)
      .pipe(
        tap(res => {
          if (!res.isError) {
            this.siteSettings = res.result ?? {
              siteName: ''
            };
          }
        })
      );
  }

  getHTMLData(pageName: string) {
    return this.http
      .get<ApiResponse<string>>(`${this._apiUrl}site/content/${pageName}`)
      .pipe(map(res => res.result ?? ''));
  }

  saveData(data: SiteSettings) {
    return this.http.post<ApiResponse<SiteSettings>>(
      `${this._apiUrl}site/settings`,
      data
    );
  }

  saveHTMLData(data: SettingsDocument) {
    return this.http.post<ApiResponse<SettingsDocument>>(
      `${this._apiUrl}site/content/${data.pageName}`,
      { content: data.html }
    );
  }
}

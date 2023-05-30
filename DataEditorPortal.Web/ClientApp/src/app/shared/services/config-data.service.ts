import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { map, Observable, Subject, tap } from 'rxjs';
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
  public sidebarCollapsed = false;
  public licenseExpired = false;

  public menuChange$ = new Subject();
  public licenseExpiredChange$ = new Subject<boolean>();

  constructor(
    private http: HttpClient,
    @Inject('API_URL') apiUrl: string,
    private router: Router
  ) {
    this._apiUrl = apiUrl;
    this.licenseExpiredChange$.subscribe(val => {
      if (this.router.url !== '/site-settings') {
        if (val) {
          this.router.navigate(['/site-settings']);
        }
      }
      this.licenseExpired = val;
    });
  }

  getSiteVersion() {
    return this.http.get(this._apiUrl + 'site/version');
  }

  getSiteEnvironment() {
    return this.http
      .get<{
        result: HeaderText;
      }>(`${this._apiUrl}site/env`)
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

  getLicense() {
    return this.http
      .get<ApiResponse<{ isExpired: boolean; license: string }>>(
        `${this._apiUrl}site/license`
      )
      .pipe(map(res => res.result ?? { isExpired: false, license: '' }));
  }

  saveLicense(license: string) {
    return this.http.post<ApiResponse<string>>(`${this._apiUrl}site/license`, {
      license
    });
  }
}

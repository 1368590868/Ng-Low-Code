import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import {
  BehaviorSubject,
  combineLatest,
  filter,
  map,
  Observable,
  share,
  Subject,
  switchMap,
  tap
} from 'rxjs';
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
  dbProvider?: string;
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
  public isLogin = false;
  public licenseExpired = false;

  public menuChange$ = new Subject();
  public siteMenus$ = this.menuChange$.asObservable().pipe(
    filter(() => this.isLogin),
    switchMap(() => {
      return this.getSiteMenus();
    }),
    share()
  );

  public menuGroupChange$ = new Subject<SiteMenu | undefined>();
  public menusInGroup$ = new BehaviorSubject<SiteMenu[]>([]);
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

    combineLatest([this.siteMenus$, this.menuGroupChange$.asObservable()])
      .pipe(
        map(([menus, group]) => {
          if (group) {
            const item = menus.find(m => m.name === group.name);
            return item ? item.items || [] : [];
          } else {
            return menus.map(m => m.items || []).flat() || [];
          }
        })
      )
      .subscribe(menus => this.menusInGroup$.next(menus));
  }

  getSiteVersion() {
    return this.http.get(this._apiUrl + 'site/version');
  }

  getSiteEnvironment() {
    return this.http
      .get<{
        data: HeaderText;
      }>(`${this._apiUrl}site/env`)
      .pipe(
        tap(res => {
          this.headerText = res.data;
        })
      );
  }

  getSiteMenus(): Observable<SiteMenu[]> {
    return this.http
      .post<ApiResponse<SiteMenu[]>>(`${this._apiUrl}site/menus`, null)
      .pipe(map(res => res.data || []));
  }

  getHomeMenus(): Observable<SiteMenu[]> {
    return this.http
      .post<ApiResponse<SiteMenu[]>>(`${this._apiUrl}site/menus`, null)
      .pipe(map(res => res.data || []));
  }

  public siteSettings: SiteSettings = {
    siteLogo: '',
    siteName: '',
    dbProvider: ''
  };

  getSiteSettings() {
    return this.http
      .get<ApiResponse<SiteSettings>>(`${this._apiUrl}site/settings`)
      .pipe(
        tap(res => {
          if (res.code === 200) {
            this.siteSettings = res.data ?? {
              siteName: '',
              dbProvider: 'SqlConnection'
            };
          }
        })
      );
  }

  getHTMLData(pageName: string) {
    return this.http
      .get<ApiResponse<string>>(`${this._apiUrl}site/content/${pageName}`)
      .pipe(map(res => res.data ?? ''));
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
      .pipe(map(res => res.data ?? { isExpired: false, license: '' }));
  }

  saveLicense(license: string) {
    return this.http.post<ApiResponse<string>>(`${this._apiUrl}site/license`, {
      license
    });
  }

  public dropdownItemSize?: number;
  calcDropdownItemSize() {
    const htmlString =
      '<div class="p-dropdown-panel"><div class="p-dropdown-items"><div class="p-dropdown-item">123</div></div></div>';
    const divElement = document.createElement('div');
    divElement.innerHTML = htmlString;

    document.body.appendChild(divElement);
    this.dropdownItemSize =
      divElement.querySelector<HTMLDivElement>(
        '.p-dropdown-item'
      )?.offsetHeight;
    document.body.removeChild(divElement);
  }
}

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

  getHTMLData() {
    return of({
      aboutHtml:
        '<h3>About WOTS</h3><p><br></p><p>The Work Order Tracking System (WOTS) was originally created for CenterPoint Energy (CNP) GIS employees to track the work order flow, but now it is widely used by GIS, Work Order Management (WOM), Operation, Engineering, Compliance, and Leadership to track Gas, Electric, Major Underground and Landbase requests, work orders and data corrections submitted for digitizing into GIS. Requests are primarily submitted by internal company employees as work orders to digitize. CNP and Contract personnel use the application for data entry, QC, problem resolution, work assignment, progress tracking and reporting.</p><p><strong>Supported internet browsers for WOTS are Microsoft Edge and Google Chrome. Do not use Internet Explorer to access this site.</strong></p><p><img src="http://localhost:4200/assets/Images/ie.png"><img src="http://localhost:4200/assets/Images/chrome.png"></p>',
      contactHtml:
        '<h3>Contact</h3><p>For technical support, website issues, user access</p><p><strong>GIS Support Desk&nbsp;</strong><a href="mailto:gissupportdesk@centerpointenergy.com" rel="noopener noreferrer" target="_blank">gissupportdesk@centerpointenergy.com</a></p><p>For electric and landbase workorder, data correction and facilities related support</p><p><strong>Deepa Hukeri&nbsp;</strong><a href="mailto:deepalaxmi.hukeri@centerpointenergy.com" rel="noopener noreferrer" target="_blank">deepalaxmi.hukeri@centerpointenergy.com</a></p><p>For gas and landbase workorder, data correction and facilities related support</p><p><strong>Christoper Huff&nbsp;</strong><a href="mailto:Christoper.Huff@centerpointenergy.com" rel="noopener noreferrer" target="_blank">Christoper.Huff@centerpointenergy.com</a></p><p><strong>Belinda Walker&nbsp;</strong><a href="mailto:Belinda.Walker@centerpointenergy.com" rel="noopener noreferrer" target="_blank">Belinda.Walker@centerpointenergy.com</a></p>'
    });
  }

  saveData(data: SiteSettings) {
    return this.http.post<ApiResponse<SiteSettings>>(
      `${this._apiUrl}site/settings`,
      data
    );
  }

  saveHTMLData(data: SettingsDocument) {
    return this.http.post<ApiResponse<SettingsDocument>>(
      `${this._apiUrl}site/settingsPage`,
      data
    );
  }
}

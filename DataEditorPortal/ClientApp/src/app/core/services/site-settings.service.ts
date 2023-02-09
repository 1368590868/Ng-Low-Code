import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { FormControl } from '@angular/forms';
import { tap } from 'rxjs';
import { ApiResponse } from '../models/api-response';

export interface SiteSettings {
  siteIcon?: string;
  siteName: FormControl;
}

@Injectable({
  providedIn: 'root'
})
export class SiteSettingsService {
  public _apiUrl: string;
  public durationMs = 5000;

  public oldSiteIcon = '';
  public oldSiteName = new FormControl('');

  public siteSettings: SiteSettings = {
    siteIcon: '',
    siteName: new FormControl('')
  };

  constructor(private http: HttpClient, @Inject('API_URL') apiUrl: string) {
    this._apiUrl = apiUrl;
  }

  getSiteSettings() {
    return this.http
      .get<ApiResponse<SiteSettings>>(`${this._apiUrl}site/environment`)
      .pipe(
        tap(res => {
          if (!res.isError) {
            this.siteSettings = {
              ...res.result,
              siteName: new FormControl(res.result?.siteName)
            } || {
              siteIcon: '',
              siteName: ''
            };

            this.oldSiteIcon = res.result?.siteIcon || '';
            this.oldSiteName = new FormControl(res.result?.siteName) || '';
          }
        })
      );
  }

  convertOldSiteSettings() {
    this.siteSettings.siteIcon = this.oldSiteIcon;
    this.siteSettings.siteName = this.oldSiteName;
  }

  convertNewSiteSettings() {
    this.oldSiteIcon = this.siteSettings.siteIcon || '';
    this.oldSiteName = this.siteSettings.siteName;
  }

  saveData(data: SiteSettings) {
    return this.http.post<ApiResponse<SiteSettings>>(
      `${this._apiUrl}site/environment`,
      { body: JSON.stringify(data) }
    );
  }
}

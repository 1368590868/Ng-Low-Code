import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { ApiResponse } from '../models/api-response';

export interface SiteSettings {
  picture: string;
  siteTitle: string;
}

@Injectable({
  providedIn: 'root'
})
export class SiteSettingsService {
  public _apiUrl: string;
  public durationMs = 5000;

  constructor(private http: HttpClient, @Inject('API_URL') apiUrl: string) {
    this._apiUrl = apiUrl;
  }

  saveData(data: SiteSettings) {
    return this.http.post<ApiResponse<SiteSettings>>(
      `${this._apiUrl}User/GetLoggedInUser`,
      { body: JSON.stringify(data) }
    );
  }
}

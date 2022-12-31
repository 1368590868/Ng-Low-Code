import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ConfigDataService {
  public _apiUrl: string;
  constructor(private http: HttpClient, @Inject('API_URL') apiUrl: string) {
    this._apiUrl = apiUrl;
  }

  getSiteVersion() {
    return this.http.get(this._apiUrl + 'site/version', {
      withCredentials: true
    });
  }

  getSiteEnvironment() {
    return this.http.get(`${this._apiUrl}site/environment`, {
      withCredentials: true
    });
  }

  getLoggedInUser() {
    return this.http.get(`${this._apiUrl}User/GetLoggedInUser`, {
      withCredentials: true
    });
  }

  getSiteMenus() {
    return this.http.post(`${this._apiUrl}site/menus`, null, {
      withCredentials: true
    });
  }
}

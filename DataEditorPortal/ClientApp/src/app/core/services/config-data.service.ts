import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { MessageService } from 'primeng/api';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ConfigDataService {
  public _apiUrl: string;
  public durationMs = 5000;
  constructor(
    private http: HttpClient,
    @Inject('API_URL') apiUrl: string,
    private messageService: MessageService
  ) {
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

  getSiteMenus() {
    return this.http.post(`${this._apiUrl}site/menus`, null);
  }

  // notifyService
  notifySuccess(summary: string, detail: string) {
    this.messageService.add({
      severity: 'success',
      summary: summary,
      detail: detail,
      life: this.durationMs
    });
  }
  notifyInfo(summary: string, detail: string) {
    this.messageService.add({
      severity: 'info',
      summary: summary,
      detail: detail,
      life: this.durationMs
    });
  }
  notifyWarning(summary: string, detail: string) {
    this.messageService.add({
      severity: 'warn',
      summary: summary,
      detail: detail,
      life: this.durationMs
    });
  }
  notifyError(summary: string, detail: string) {
    this.messageService.add({
      severity: 'error',
      summary: summary,
      detail: detail,
      life: this.durationMs
    });
  }

  notifyErrorInPipe<T>(
    err: any,
    returnData?: { data: []; total: 0 } | any
  ): Observable<T> {
    this.notifyError(err.name || err.statusText, err.message || err.error);
    return of(returnData);
  }
}

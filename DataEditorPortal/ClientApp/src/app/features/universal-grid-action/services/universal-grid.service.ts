import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UniversalGridService {
  public currentPortalItem = 'usermanagement';

  public _apiUrl: string;
  constructor(private http: HttpClient, @Inject('API_URL') apiUrl: string) {
    this._apiUrl = apiUrl;
  }

  getTableColumns(): any {
    return this.http.get(
      `${this._apiUrl}UniversalGrid/${this.currentPortalItem}/config/columns`
    );
  }

  getTableData(tableParams: any) {
    return this.http.post<{ data: any[]; total: number }>(
      `${this._apiUrl}UniversalGrid/${this.currentPortalItem}/data`,
      tableParams
    );
  }

  getSearchConfig(): any {
    return this.http.get(
      `${this._apiUrl}UniversalGrid/${this.currentPortalItem}/config/search`
    );
    // return this.http.get<any>('assets/customers-large.json');
  }

  getDetailConfig(): any {
    return this.http.get(
      `${this._apiUrl}UniversalGrid/${this.currentPortalItem}/config/detail`
    );
  }

  getDetailData(id: string): any {
    return this.http.get(
      `${this._apiUrl}UniversalGrid/${this.currentPortalItem}/data/${id}`
    );
  }
}

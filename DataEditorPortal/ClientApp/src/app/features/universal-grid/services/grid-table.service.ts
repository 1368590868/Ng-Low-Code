import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class GridTableService {
  public _apiUrl: string;
  constructor(private http: HttpClient, @Inject('API_URL') apiUrl: string) {
    this._apiUrl = apiUrl;
  }

  getCustomersLarge() {
    return this.http
      .get<any>('assets/customers-large.json')
      .toPromise()
      .then(res => <any>res)
      .then(data => {
        return data;
      });
  }

  getTableColumns(): any {
    return this.http.get(
      `${this._apiUrl}UniversalGrid/UserManagement/config/columns`
    );
  }

  getTableData(tableParams: any) {
    return this.http.post<{ data: any[]; total: number }>(
      `${this._apiUrl}UniversalGrid/UserManagement/data`,
      tableParams
    );
  }
}

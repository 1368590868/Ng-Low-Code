import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { Customer } from './table/table.component';

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

  getTableData(tableParams: any) {
    return this.http.post<{ data: any[]; total: number }>(
      `${this._apiUrl}UniversalGrid/UserManagement/data`,
      tableParams,
      {
        withCredentials: true
      }
    );
  }
}

import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { ApiResponse } from 'src/app/shared';
import { TableConfig } from '../link-data-editor.type';

@Injectable({
  providedIn: 'root'
})
export class LinkDataTableService {
  public _apiUrl: string;
  constructor(private http: HttpClient, @Inject('API_URL') apiUrl: string) {
    this._apiUrl = apiUrl;
  }

  getTableConfig(name: string): Observable<TableConfig> {
    return this.http
      .post<ApiResponse<TableConfig>>(
        `${this._apiUrl}universal-grid/${name}/linked-table-editor/table-config`,
        null
      )
      .pipe(
        map(
          res =>
            res.result || {
              columns: [],
              table2IdColumn: '',
              table2ReferenceKey: '',
              table2Name: ''
            }
        )
      );
  }

  getTableData(name: string, tableParams: any) {
    return this.http
      .post<ApiResponse<any>>(
        `${this._apiUrl}universal-grid/${name}/linked-table-editor/table-data`,
        tableParams
      )
      .pipe(map(res => res.result?.data || []));
  }
}

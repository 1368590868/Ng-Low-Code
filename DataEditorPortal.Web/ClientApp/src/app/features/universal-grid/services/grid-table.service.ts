import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { map, Observable, Subject } from 'rxjs';
import { ApiResponse, GridParam, SearchParam } from 'src/app/shared';
import {
  GridColumn,
  GridConfig,
  GridResult,
  GridSearchConfig
} from '../models/grid-types';

@Injectable()
export class GridTableService {
  public searchClicked$ = new Subject<SearchParam>();

  public _apiUrl: string;
  constructor(private http: HttpClient, @Inject('API_URL') apiUrl: string) {
    this._apiUrl = apiUrl;
  }

  getTableConfig(name: string): Observable<GridConfig> {
    return this.http
      .get<ApiResponse<GridConfig>>(
        `${this._apiUrl}universal-grid/${name}/grid-config`
      )
      .pipe(map(res => res.result || { dataKey: 'Id' }));
  }

  getTableColumns(name: string): Observable<GridColumn[]> {
    return this.http
      .get<ApiResponse<GridColumn[]>>(
        `${this._apiUrl}universal-grid/${name}/config/columns`
      )
      .pipe(map(res => res.result || []));
  }

  getTableColumnFilterOptions(name: string, column: string): Observable<any[]> {
    return this.http
      .get<ApiResponse<any[]>>(
        `${this._apiUrl}universal-grid/${name}/config/column/filter-options?column=${column}`
      )
      .pipe(map(res => res.result || []));
  }

  getTableData(name: string, tableParams: GridParam): Observable<GridResult> {
    return this.http
      .post<ApiResponse<GridResult>>(
        `${this._apiUrl}universal-grid/${name}/data`,
        tableParams
      )
      .pipe(map(res => res.result || { data: [], total: 0 }));
  }

  getSearchConfig(name: string): Observable<GridSearchConfig[]> {
    return this.http
      .get<ApiResponse<GridSearchConfig[]>>(
        `${this._apiUrl}universal-grid/${name}/config/search`
      )
      .pipe(map(res => res.result || []));
  }
}

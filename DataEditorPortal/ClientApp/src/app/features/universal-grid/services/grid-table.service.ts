import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { map, Observable, Subject } from 'rxjs';
import {
  ApiResponse,
  GridParam,
  NotifyService,
  SearchParam
} from 'src/app/shared';
import {
  GridColumn,
  GridConfig,
  GridResult,
  GridSearchConfig
} from '../models/grid-types';

@Injectable({
  providedIn: 'root'
})
export class GridTableService {
  public searchClicked$ = new Subject<SearchParam>();
  public currentPortalItem = '';

  public _apiUrl: string;
  constructor(
    private http: HttpClient,
    private notifyService: NotifyService,
    @Inject('API_URL') apiUrl: string
  ) {
    this._apiUrl = apiUrl;
  }

  getTableConfig(): Observable<GridConfig> {
    return this.http
      .get<ApiResponse<GridConfig>>(
        `${this._apiUrl}UniversalGrid/${this.currentPortalItem}/grid-config`
      )
      .pipe(map(res => res.result || { dataKey: 'Id' }));
  }

  getTableColumns(): Observable<GridColumn[]> {
    return this.http
      .get<ApiResponse<GridColumn[]>>(
        `${this._apiUrl}UniversalGrid/${this.currentPortalItem}/config/columns`
      )
      .pipe(map(res => res.result || []));
  }

  getTableColumnFilterOptions(column: string): Observable<any[]> {
    return this.http
      .get<ApiResponse<any[]>>(
        `${this._apiUrl}UniversalGrid/${this.currentPortalItem}/config/column/filter-options?column=${column}`
      )
      .pipe(map(res => res.result || []));
  }

  getTableData(tableParams: GridParam): Observable<GridResult> {
    return this.http
      .post<ApiResponse<GridResult>>(
        `${this._apiUrl}UniversalGrid/${this.currentPortalItem}/data`,
        tableParams
      )
      .pipe(map(res => res.result || { data: [], total: 0 }));
  }

  getSearchConfig(): Observable<GridSearchConfig[]> {
    return this.http
      .get<ApiResponse<GridSearchConfig[]>>(
        `${this._apiUrl}UniversalGrid/${this.currentPortalItem}/config/search`
      )
      .pipe(map(res => res.result || []));
  }
}

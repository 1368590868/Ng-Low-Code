import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { Observable, Subject, map } from 'rxjs';
import { ApiResponse, GridParam, SearchParam } from 'src/app/shared';
import { GridColumn, GridConfig, GridResult, GridSearchConfig, LinkedGridConfig } from '../models/grid-types';

@Injectable()
export class GridTableService {
  public searchClicked$ = new Subject<SearchParam | undefined>();

  public _apiUrl: string;
  constructor(private http: HttpClient, @Inject('API_URL') apiUrl: string) {
    this._apiUrl = apiUrl;
  }

  getTableConfig(name: string): Observable<GridConfig> {
    return this.http
      .get<ApiResponse<GridConfig>>(`${this._apiUrl}universal-grid/${name}/grid-config`)
      .pipe(map(res => res.data || { dataKey: 'Id' }));
  }

  getLinkedTableConfig(name: string): Observable<LinkedGridConfig> {
    return this.http
      .get<ApiResponse<LinkedGridConfig>>(`${this._apiUrl}universal-grid/${name}/linked/grid-config`)
      .pipe(
        map(
          res =>
            res.data || {
              primaryTableName: '',
              secondaryTableName: '',
              useAsMasterDetailView: false
            }
        )
      );
  }

  getHighlightLinkedData(table1Name: string, table2Id: string): Observable<any[]> {
    return this.http
      .get<ApiResponse<any[]>>(`${this._apiUrl}universal-grid/${table1Name}/linked/grid-data-ids`, {
        params: { table2Id }
      })
      .pipe(map(res => res.data || []));
  }

  getTableColumns(name: string): Observable<GridColumn[]> {
    return this.http
      .get<ApiResponse<GridColumn[]>>(`${this._apiUrl}universal-grid/${name}/config/columns`)
      .pipe(map(res => res.data || []));
  }

  getTableColumnFilterOptions(
    name: string,
    column: string,
    tableParams: GridParam | undefined
  ): Observable<{ label: any; value: any }[]> {
    return this.http
      .post<ApiResponse<{ label: any; value: any }[]>>(
        `${this._apiUrl}universal-grid/${name}/config/column/filter-options?column=${column}`,
        tableParams || {}
      )
      .pipe(map(res => res.data || []));
  }

  getTableData(name: string, tableParams: GridParam): Observable<GridResult> {
    return this.http
      .post<ApiResponse<GridResult>>(`${this._apiUrl}universal-grid/${name}/data`, tableParams)
      .pipe(map(res => res.data || { data: [], total: 0 }));
  }

  getSearchConfig(name: string): Observable<GridSearchConfig[]> {
    return this.http
      .get<ApiResponse<GridSearchConfig[]>>(`${this._apiUrl}universal-grid/${name}/config/search`)
      .pipe(map(res => res.data || []));
  }

  getExistingSearchOptions(gridName: string): Observable<{ label: string; value: string }[]> {
    return this.http
      .get<ApiResponse<{ label: string; value: string }[]>>(
        `${this._apiUrl}universal-grid/${gridName}/grids-with-same-config`
      )
      .pipe(map(x => x.data || []));
  }
}

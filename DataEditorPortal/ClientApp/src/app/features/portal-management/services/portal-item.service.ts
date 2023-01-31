import { HttpClient, HttpParams } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { delay, map, Observable, of, Subject } from 'rxjs';
import { NotifyService } from 'src/app/app.module';
import { ApiResponse } from 'src/app/core/models/api-response';
import {
  DataSourceConfig,
  DataSourceTable,
  DataSourceTableColumn,
  GridColumn,
  GridFormConfig,
  GridSearchField,
  PortalItem,
  PortalItemData
} from '../models/portal-item';

@Injectable({
  providedIn: 'root'
})
export class PortalItemService {
  public _apiUrl: string;

  public currentPortalItemId?: string;
  public currentPortalDataSourceTableColumns?: any;

  constructor(
    private http: HttpClient,
    private notifyService: NotifyService,
    @Inject('API_URL') apiUrl: string
  ) {
    this._apiUrl = apiUrl;
  }

  getPortalList(): Observable<PortalItem[]> {
    return this.http
      .get<ApiResponse<PortalItem[]>>(`${this._apiUrl}portal-item/list`)
      .pipe(map(x => x.result || []));
  }

  createRootFolder(data: PortalItemData): Observable<ApiResponse<string>> {
    return this.http.post<ApiResponse<string>>(
      `${this._apiUrl}portal-item/folder/create`,
      data
    );
  }

  updateRootFolder(
    id: string,
    data: PortalItemData
  ): Observable<ApiResponse<string>> {
    return this.http.put<ApiResponse<string>>(
      `${this._apiUrl}portal-item/folder/${id}/update`,
      data
    );
  }

  publish(id: string): Observable<ApiResponse<string>> {
    return this.http.put<ApiResponse<string>>(
      `${this._apiUrl}portal-item/${id}/publish`,
      null
    );
  }

  unpublish(id: string): Observable<ApiResponse<string>> {
    return this.http.put<ApiResponse<string>>(
      `${this._apiUrl}portal-item/${id}/unpublish`,
      null
    );
  }

  nameExists(name: string, id?: string): Observable<ApiResponse<boolean>> {
    let params = new HttpParams().set('name', name);
    if (id) params = params.set('id', id);
    return this.http.get<ApiResponse<boolean>>(
      `${this._apiUrl}portal-item/name-exists`,
      {
        params
      }
    );
  }

  getPortalDetails(id: string): Observable<PortalItemData> {
    return this.http
      .get<ApiResponse<PortalItemData>>(
        `${this._apiUrl}portal-item/${id}/details`
      )
      .pipe(map(x => x.result || {}));
  }

  createPortalDetails(
    data: PortalItemData
  ): Observable<ApiResponse<PortalItemData>> {
    return this.http.post<ApiResponse<PortalItemData>>(
      `${this._apiUrl}portal-item/create`,
      data
    );
  }

  updatePortalDetails(
    id: string,
    data: PortalItemData
  ): Observable<ApiResponse<PortalItemData>> {
    return this.http.put<ApiResponse<PortalItemData>>(
      `${this._apiUrl}portal-item/${id}/update`,
      data
    );
  }

  // datasource
  getDataSourceTables(): Observable<DataSourceTable[]> {
    return this.http
      .get<ApiResponse<DataSourceTable[]>>(
        `${this._apiUrl}portal-item/datasource/tables`
      )
      .pipe(map(x => x.result || []));
  }

  getDataSourceTableColumns(
    tableSchema: string,
    tableName: string
  ): Observable<DataSourceTableColumn[]> {
    return this.http
      .get<ApiResponse<DataSourceTableColumn[]>>(
        `${this._apiUrl}portal-item/datasource/${tableSchema}/${tableName}/columns`
      )
      .pipe(map(x => x.result || []));
  }

  getDataSourceTableColumnsByPortalId(
    id: string
  ): Observable<DataSourceTableColumn[]> {
    return this.http
      .get<ApiResponse<DataSourceTableColumn[]>>(
        `${this._apiUrl}portal-item/${id}/datasource/columns`
      )
      .pipe(map(x => x.result || []));
  }

  getDataSourceConfig(id: string): Observable<DataSourceConfig> {
    return this.http
      .get<ApiResponse<DataSourceConfig>>(
        `${this._apiUrl}portal-item/${id}/datasource`
      )
      .pipe(
        map(
          x =>
            x.result || {
              tableName: '',
              tableSchema: '',
              idColumn: '',
              filters: [],
              sortBy: []
            }
        )
      );
  }

  saveDataSourceConfig(id: string, data: DataSourceConfig) {
    return this.http.post<ApiResponse<boolean>>(
      `${this._apiUrl}portal-item/${id}/datasource`,
      data
    );
  }

  getGridColumnsConfig(id: string): Observable<GridColumn[]> {
    return this.http
      .get<ApiResponse<GridColumn[]>>(
        `${this._apiUrl}portal-item/${id}/grid-columns`
      )
      .pipe(map(x => x.result || []));
  }

  saveGridColumnsConfig(id: string, data: GridColumn[]) {
    return this.http.post<ApiResponse<boolean>>(
      `${this._apiUrl}portal-item/${id}/grid-columns`,
      data
    );
  }

  getGridSearchConfig(id: string): Observable<GridSearchField[]> {
    return this.http
      .get<ApiResponse<GridSearchField[]>>(
        `${this._apiUrl}portal-item/${id}/grid-search`
      )
      .pipe(map(x => x.result || []));
  }

  saveGridSearchConfig(id: string, data: GridSearchField[]) {
    return this.http.post<ApiResponse<boolean>>(
      `${this._apiUrl}portal-item/${id}/grid-search`,
      data
    );
  }

  getGridFormConfig(id: string): Observable<GridFormConfig> {
    return this.http
      .get<ApiResponse<GridFormConfig>>(
        `${this._apiUrl}portal-item/${id}/grid-form`
      )
      .pipe(map(x => x.result || {}));
  }

  saveGridFormConfig(id: string, data: GridFormConfig) {
    return this.http.post<ApiResponse<boolean>>(
      `${this._apiUrl}portal-item/${id}/grid-form`,
      data
    );
  }
}

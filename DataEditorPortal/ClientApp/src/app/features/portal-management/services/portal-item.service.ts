import { HttpClient, HttpParams } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { PrimeNGConfig } from 'primeng/api';
import { map, Observable, tap } from 'rxjs';
import { ApiResponse, ConfigDataService, NotifyService } from 'src/app/shared';
import {
  DataSourceConfig,
  DataSourceTable,
  DataSourceTableColumn,
  GirdDetailConfig,
  GridColumn,
  GridCustomAction,
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
  public currentPortalItemParentFolder?: string;
  public currentPortalItemConfigCompleted?: boolean;
  public currentPortalItemCaption?: string;

  constructor(
    private http: HttpClient,
    private notifyService: NotifyService,
    private configDataService: ConfigDataService,
    private primeNGConfig: PrimeNGConfig,
    @Inject('API_URL') apiUrl: string
  ) {
    this._apiUrl = apiUrl;
  }

  getFilterMatchModeOptions({ filterType, type }: any) {
    if (type === 'multiSelect' || type === 'checkboxList')
      return [{ label: 'In selected values', value: 'in' }];
    if (filterType === 'boolean') return [{ label: 'Equals', value: 'equals' }];
    return (this.primeNGConfig.filterMatchModeOptions as any)[filterType]?.map(
      (key: any) => {
        return { label: this.primeNGConfig.getTranslation(key), value: key };
      }
    );
  }

  getCurrentStep(): Observable<string> {
    return this.http
      .get<ApiResponse<string>>(
        `${this._apiUrl}portal-item/${this.currentPortalItemId}/current-step`
      )
      .pipe(map(x => x.result || 'basic'));
  }

  saveCurrentStep(step: string) {
    return this.http
      .post<ApiResponse<string>>(
        `${this._apiUrl}portal-item/${this.currentPortalItemId}/current-step?step=${step}`,
        null
      )
      .subscribe();
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
    return this.http
      .put<ApiResponse<string>>(
        `${this._apiUrl}portal-item/${id}/publish`,
        null
      )
      .pipe(
        tap(() => {
          this.configDataService.menuChange$.next(null);
        })
      );
  }

  unpublish(id: string): Observable<ApiResponse<string>> {
    return this.http
      .put<ApiResponse<string>>(
        `${this._apiUrl}portal-item/${id}/unpublish`,
        null
      )
      .pipe(
        tap(() => {
          this.configDataService.menuChange$.next(null);
        })
      );
  }

  moveUp(id: string): Observable<ApiResponse<boolean>> {
    return this.http
      .post<ApiResponse<boolean>>(
        `${this._apiUrl}portal-item/${id}/move-up`,
        null
      )
      .pipe(
        tap(() => {
          this.configDataService.menuChange$.next(null);
        })
      );
  }

  moveDown(id: string): Observable<ApiResponse<boolean>> {
    return this.http
      .post<ApiResponse<boolean>>(
        `${this._apiUrl}portal-item/${id}/move-down`,
        null
      )
      .pipe(
        tap(() => {
          this.configDataService.menuChange$.next(null);
        })
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

  getPortalDetails(): Observable<PortalItemData> {
    return this.http
      .get<ApiResponse<PortalItemData>>(
        `${this._apiUrl}portal-item/${this.currentPortalItemId}/details`
      )
      .pipe(map(x => x.result || {}));
  }

  createPortalDetails(data: PortalItemData): Observable<ApiResponse<string>> {
    return this.http.post<ApiResponse<string>>(
      `${this._apiUrl}portal-item/create`,
      data
    );
  }

  updatePortalDetails(
    data: PortalItemData
  ): Observable<ApiResponse<PortalItemData>> {
    return this.http
      .put<ApiResponse<PortalItemData>>(
        `${this._apiUrl}portal-item/${this.currentPortalItemId}/update`,
        data
      )
      .pipe(
        tap(() => {
          this.configDataService.menuChange$.next(null);
        })
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

  getDataSourceTableColumnsByQuery(
    queryText: string
  ): Observable<DataSourceTableColumn[]> {
    return this.http
      .post<ApiResponse<DataSourceTableColumn[]>>(
        `${this._apiUrl}portal-item/datasource/query/columns`,
        { queryText }
      )
      .pipe(map(x => x.result || []));
  }

  getDataSourceTableColumnsByPortalId(): Observable<DataSourceTableColumn[]> {
    return this.http
      .get<ApiResponse<DataSourceTableColumn[]>>(
        `${this._apiUrl}portal-item/${this.currentPortalItemId}/datasource/columns`
      )
      .pipe(map(x => x.result || []));
  }

  getDataSourceConfig(): Observable<DataSourceConfig> {
    return this.http
      .get<ApiResponse<DataSourceConfig>>(
        `${this._apiUrl}portal-item/${this.currentPortalItemId}/datasource`
      )
      .pipe(map(x => x.result || {}));
  }

  saveDataSourceConfig(data: DataSourceConfig) {
    return this.http.post<ApiResponse<boolean>>(
      `${this._apiUrl}portal-item/${this.currentPortalItemId}/datasource`,
      data
    );
  }

  getGridColumnsConfig(): Observable<GridColumn[]> {
    return this.http
      .get<ApiResponse<GridColumn[]>>(
        `${this._apiUrl}portal-item/${this.currentPortalItemId}/grid-columns`
      )
      .pipe(map(x => x.result || []));
  }

  saveGridColumnsConfig(data: GridColumn[]) {
    return this.http.post<ApiResponse<boolean>>(
      `${this._apiUrl}portal-item/${this.currentPortalItemId}/grid-columns`,
      data
    );
  }

  getGridSearchConfig(): Observable<GridSearchField[]> {
    return this.http
      .get<ApiResponse<GridSearchField[]>>(
        `${this._apiUrl}portal-item/${this.currentPortalItemId}/grid-search`
      )
      .pipe(map(x => x.result || []));
  }

  saveGridSearchConfig(data: GridSearchField[]) {
    return this.http.post<ApiResponse<boolean>>(
      `${this._apiUrl}portal-item/${this.currentPortalItemId}/grid-search`,
      data
    );
  }

  getGridFormConfig(): Observable<GirdDetailConfig> {
    return this.http
      .get<ApiResponse<GirdDetailConfig>>(
        `${this._apiUrl}portal-item/${this.currentPortalItemId}/grid-form`
      )
      .pipe(map(x => x.result || {}));
  }

  saveGridFormConfig(data: GirdDetailConfig) {
    return this.http.post<ApiResponse<boolean>>(
      `${this._apiUrl}portal-item/${this.currentPortalItemId}/grid-form`,
      data
    );
  }

  getCustomActions(id: string): Observable<GridCustomAction[]> {
    return this.http
      .get<ApiResponse<GridCustomAction[]>>(
        `${this._apiUrl}portal-item/${id}/custom-actions`
      )
      .pipe(map(x => x.result || []));
  }

  saveCustomActions(id: string, data: GridCustomAction[]) {
    return this.http.post<ApiResponse<boolean>>(
      `${this._apiUrl}portal-item/${id}/custom-actions`,
      data
    );
  }
}

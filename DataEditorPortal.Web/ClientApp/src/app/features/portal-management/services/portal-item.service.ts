import { HttpClient, HttpParams } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { PrimeNGConfig } from 'primeng/api';
import { map, Observable, of, tap } from 'rxjs';
import { ApiResponse, ConfigDataService, NotifyService } from 'src/app/shared';
import {
  DataSourceConfig,
  DataSourceConnection,
  DataSourceTable,
  DataSourceTableColumn,
  GirdDetailConfig,
  GridColumn,
  GridCustomAction,
  GridSearchField,
  ImportPortal,
  LinkedDataSourceConfig,
  LinkedSingleConfig,
  PortalItem,
  PortalItemData
} from '../models/portal-item';

@Injectable({
  providedIn: 'root'
})
export class PortalItemService {
  public _apiUrl: string;

  public itemId?: string;
  public parentFolder?: string;
  public configCompleted?: boolean;
  public itemCaption?: string;
  public itemType?: string;
  public dataSourceConnectionName?: string;

  constructor(
    private http: HttpClient,
    private notifyService: NotifyService,
    private configDataService: ConfigDataService,
    private primeNGConfig: PrimeNGConfig,
    @Inject('API_URL') apiUrl: string
  ) {
    this._apiUrl = apiUrl;
  }

  refreshMenu() {
    this.configDataService.menuChange$.next(null);
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
        `${this._apiUrl}portal-item/${this.itemId}/current-step`
      )
      .pipe(map(x => x.result || 'basic'));
  }

  saveCurrentStep(step: string) {
    return this.http
      .post<ApiResponse<string>>(
        `${this._apiUrl}portal-item/${this.itemId}/current-step?step=${step}`,
        null
      )
      .subscribe();
  }

  getLinkedDatasource(id: string) {
    return this.http.get<ApiResponse<LinkedDataSourceConfig>>(
      `${this._apiUrl}portal-item/${id}/linked-datasource`
    );
  }

  saveLinkedDatasource(data: LinkedDataSourceConfig) {
    return this.http
      .post<ApiResponse<string>>(
        `${this._apiUrl}portal-item/${this.itemId}/linked-datasource`,
        data
      )
      .pipe(tap(() => this.refreshMenu()));
  }

  getLinkedSingleTableConfig(id: string): Observable<LinkedSingleConfig> {
    return this.http
      .get<ApiResponse<LinkedSingleConfig>>(
        `${this._apiUrl}portal-item/${id}/linked-single-config`
      )
      .pipe(map(x => x.result || { details: [], gridColumns: [] }));
  }

  getPortalList(): Observable<PortalItem[]> {
    return this.http
      .get<ApiResponse<PortalItem[]>>(`${this._apiUrl}portal-item/list`)
      .pipe(map(x => x.result || []));
  }

  createMenuItem(data: PortalItemData): Observable<ApiResponse<string>> {
    return this.http.post<ApiResponse<string>>(
      `${this._apiUrl}portal-item/menu-item/create`,
      data
    );
  }

  updateMenuItem(
    id: string,
    data: PortalItemData
  ): Observable<ApiResponse<string>> {
    return this.http.put<ApiResponse<string>>(
      `${this._apiUrl}portal-item/menu-item/${id}/update`,
      data
    );
  }

  deleteMenuItem(id: string): Observable<ApiResponse<boolean>> {
    return this.http
      .delete<ApiResponse<boolean>>(
        `${this._apiUrl}portal-item/menu-item/${id}/delete`
      )
      .pipe(tap(() => this.refreshMenu()));
  }

  publish(id: string): Observable<ApiResponse<string>> {
    return this.http
      .put<ApiResponse<string>>(
        `${this._apiUrl}portal-item/${id}/publish`,
        null
      )
      .pipe(tap(() => this.refreshMenu()));
  }

  unpublish(id: string): Observable<ApiResponse<string>> {
    return this.http
      .put<ApiResponse<string>>(
        `${this._apiUrl}portal-item/${id}/unpublish`,
        null
      )
      .pipe(tap(() => this.refreshMenu()));
  }

  moveUp(id: string): Observable<ApiResponse<boolean>> {
    return this.http
      .post<ApiResponse<boolean>>(
        `${this._apiUrl}portal-item/${id}/move-up`,
        null
      )
      .pipe(tap(() => this.refreshMenu()));
  }

  moveDown(id: string): Observable<ApiResponse<boolean>> {
    return this.http
      .post<ApiResponse<boolean>>(
        `${this._apiUrl}portal-item/${id}/move-down`,
        null
      )
      .pipe(tap(() => this.refreshMenu()));
  }

  getCodeName(name: string): Observable<ApiResponse<string>> {
    const params = new HttpParams().set('name', name);
    return this.http.get<ApiResponse<string>>(
      `${this._apiUrl}portal-item/get-code-name`,
      {
        params
      }
    );
  }

  nameExists(name: string, id?: string): Observable<ApiResponse<any>> {
    let params = new HttpParams().set('name', name);
    if (id) params = params.set('id', id);
    return this.http.get<ApiResponse<any>>(
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
        `${this._apiUrl}portal-item/${this.itemId}/update`,
        data
      )
      .pipe(tap(() => this.refreshMenu()));
  }

  deletePortalItem(id: string): Observable<ApiResponse<boolean>> {
    return this.http
      .delete<ApiResponse<boolean>>(`${this._apiUrl}portal-item/${id}/delete`)
      .pipe(tap(() => this.refreshMenu()));
  }

  // datasource
  getDataSourceConnections(): Observable<DataSourceConnection[]> {
    return this.http
      .get<ApiResponse<DataSourceConnection[]>>(
        `${this._apiUrl}portal-item/datasource/connections`
      )
      .pipe(map(x => x.result || []));
  }

  createDataSourceConnection(
    data: DataSourceConnection
  ): Observable<ApiResponse<string>> {
    return this.http.post<ApiResponse<string>>(
      `${this._apiUrl}portal-item/datasource/connections/create`,
      data
    );
  }

  updateDataSourceConnection(
    id: string,
    data: DataSourceConnection
  ): Observable<ApiResponse<string>> {
    return this.http.put<ApiResponse<string>>(
      `${this._apiUrl}portal-item/datasource/connections${id}/update`,
      data
    );
  }

  getDataSourceTables(connectionName: string): Observable<DataSourceTable[]> {
    return this.http
      .get<ApiResponse<DataSourceTable[]>>(
        `${this._apiUrl}portal-item/datasource/${connectionName}/tables`
      )
      .pipe(map(x => x.result || []));
  }

  getDataSourceTableColumns(
    connectionName: string,
    tableSchema: string,
    tableName: string
  ): Observable<DataSourceTableColumn[]> {
    return this.http
      .get<ApiResponse<DataSourceTableColumn[]>>(
        `${this._apiUrl}portal-item/datasource/${connectionName}/table-columns`,
        {
          params: {
            tableSchema,
            tableName
          }
        }
      )
      .pipe(map(x => x.result || []));
  }

  getDataSourceTableColumnsByQuery(
    connectionName: string,
    queryText: string
  ): Observable<ApiResponse<DataSourceTableColumn[]>> {
    return this.http.post<ApiResponse<DataSourceTableColumn[]>>(
      `${this._apiUrl}portal-item/datasource/${connectionName}/query-columns`,
      { queryText }
    );
  }

  getDataSourceTableColumnsByPortalId(
    forForm = false
  ): Observable<DataSourceTableColumn[]> {
    return this.http
      .get<ApiResponse<DataSourceTableColumn[]>>(
        `${this._apiUrl}portal-item/${this.itemId}/datasource/columns`,
        { params: { forForm } }
      )
      .pipe(map(x => x.result || []));
  }

  getDataSourceConfig(): Observable<DataSourceConfig> {
    return this.http
      .get<ApiResponse<DataSourceConfig>>(
        `${this._apiUrl}portal-item/${this.itemId}/datasource`
      )
      .pipe(
        map(
          x =>
            x.result || {
              dataSourceConnectionName: '',
              pageSize: 100,
              idColumn: ''
            }
        )
      );
  }

  saveDataSourceConfig(data: DataSourceConfig) {
    return this.http
      .post<ApiResponse<boolean>>(
        `${this._apiUrl}portal-item/${this.itemId}/datasource`,
        data
      )
      .pipe(tap(() => this.refreshMenu()));
  }

  getGridColumnsConfig(): Observable<GridColumn[]> {
    return this.http
      .get<ApiResponse<GridColumn[]>>(
        `${this._apiUrl}portal-item/${this.itemId}/grid-columns`
      )
      .pipe(map(x => x.result || []));
  }

  saveGridColumnsConfig(data: GridColumn[]) {
    return this.http
      .post<ApiResponse<boolean>>(
        `${this._apiUrl}portal-item/${this.itemId}/grid-columns`,
        data
      )
      .pipe(tap(() => this.refreshMenu()));
  }

  getGridSearchConfig(): Observable<GridSearchField[]> {
    return this.http
      .get<ApiResponse<GridSearchField[]>>(
        `${this._apiUrl}portal-item/${this.itemId}/grid-search`
      )
      .pipe(map(x => x.result || []));
  }

  saveGridSearchConfig(data: GridSearchField[]) {
    return this.http
      .post<ApiResponse<boolean>>(
        `${this._apiUrl}portal-item/${this.itemId}/grid-search`,
        data
      )
      .pipe(tap(() => this.refreshMenu()));
  }

  getGridFormConfig(): Observable<GirdDetailConfig> {
    return this.http
      .get<ApiResponse<GirdDetailConfig>>(
        `${this._apiUrl}portal-item/${this.itemId}/grid-form`
      )
      .pipe(map(x => x.result || {}));
  }

  saveGridFormConfig(data: GirdDetailConfig) {
    return this.http
      .post<ApiResponse<boolean>>(
        `${this._apiUrl}portal-item/${this.itemId}/grid-form`,
        data
      )
      .pipe(tap(() => this.refreshMenu()));
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

  export(id: string): Observable<Blob> {
    return this.http.post(`${this._apiUrl}portal-item/${id}/export`, null, {
      responseType: 'blob'
    });
  }

  importPortalItem(data: {
    parentId: string | null;
    attachment: any;
  }): Observable<ApiResponse<ImportPortal[]>> {
    return this.http.post<ApiResponse<ImportPortal[]>>(
      `${this._apiUrl}portal-item/preview-import`,
      data
    );
  }

  confirmPortalItem(data: {
    parentId: string | null;
    attachment: any;
    selectedObjects: string[];
  }): Observable<ApiResponse<ImportPortal[]>> {
    return this.http.post<ApiResponse<ImportPortal[]>>(
      `${this._apiUrl}portal-item/confirm-import`,
      data
    );
  }
}

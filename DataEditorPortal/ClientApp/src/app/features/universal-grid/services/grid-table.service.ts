import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import {
  GridColumn,
  GridConfig,
  GridParam,
  GridResult,
  GridSearchConfig,
  SearchParam
} from '../models/grid-types';

@Injectable({
  providedIn: 'root'
})
export class GridTableService {
  public searchClicked$ = new Subject<SearchParam>();
  public currentPortalItem = '';

  public _apiUrl: string;
  constructor(private http: HttpClient, @Inject('API_URL') apiUrl: string) {
    this._apiUrl = apiUrl;
  }

  getTableConfig(): Observable<GridConfig> {
    return this.http.get<GridConfig>(
      `${this._apiUrl}UniversalGrid/${this.currentPortalItem}/grid-config`
    );
  }

  getTableColumns(): Observable<GridColumn[]> {
    return this.http.get<GridColumn[]>(
      `${this._apiUrl}UniversalGrid/${this.currentPortalItem}/config/columns`
    );
  }

  getTableData(tableParams: GridParam): Observable<GridResult> {
    return this.http.post<GridResult>(
      `${this._apiUrl}UniversalGrid/${this.currentPortalItem}/data`,
      tableParams
    );
  }

  getSearchConfig(): Observable<GridSearchConfig[]> {
    return this.http.get<GridSearchConfig[]>(
      `${this._apiUrl}UniversalGrid/${this.currentPortalItem}/config/search`
    );
    // return this.http.get<any>('assets/customers-large.json');
  }
}

import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { share, Subject, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GridTableService {
  public searchClicked$ = new Subject<any>();
  public currentPortalItem = '';

  public _apiUrl: string;
  constructor(private http: HttpClient, @Inject('API_URL') apiUrl: string) {
    this._apiUrl = apiUrl;
  }

  getTableColumns(): any {
    return this.http.get(
      `${this._apiUrl}UniversalGrid/${this.currentPortalItem}/config/columns`
    );
  }

  getTableData(tableParams: any) {
    return this.http.post<{ data: any[]; total: number }>(
      `${this._apiUrl}UniversalGrid/${this.currentPortalItem}/data`,
      tableParams
    );
  }
}

import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ExportForm } from '../../models/export';
import { RemoveData } from '../../models/remove';

@Injectable({
  providedIn: 'root'
})
export class RemoveActionService {
  public _apiUrl: string;
  constructor(private http: HttpClient, @Inject('API_URL') apiUrl: string) {
    this._apiUrl = apiUrl;
  }

  removeTableData(columnData: ExportForm): Observable<RemoveData> {
    return this.http.post<RemoveData>(
      `${this._apiUrl}UniversalGrid/usermanagement/config/columns`,
      columnData
    );
  }
}

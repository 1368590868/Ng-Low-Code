import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Export, ExportForm } from '../../models/export';

@Injectable({
  providedIn: 'root'
})
export class ExportActionService {
  public _apiUrl: string;
  constructor(private http: HttpClient, @Inject('API_URL') apiUrl: string) {
    this._apiUrl = apiUrl;
  }

  exportFile(formData: ExportForm): Observable<Export> {
    return this.http.post(
      `${this._apiUrl}UniversalGrid/usermanagement/config/columns`,
      formData
    );
  }
}

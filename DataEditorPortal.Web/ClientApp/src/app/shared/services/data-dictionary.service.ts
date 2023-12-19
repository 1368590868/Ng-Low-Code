import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { DictionaryData } from '../models/dictionary';
import { ConfigDataService } from './config-data.service';
import { ApiResponse } from '../models/api-response';
import { GridResult } from '../models/universal.type';

@Injectable({
  providedIn: 'root'
})
export class DataDictionaryService {
  public _apiUrl: string;

  constructor(
    private http: HttpClient,
    @Inject('API_URL') apiUrl: string,
    private configDataService: ConfigDataService
  ) {
    this._apiUrl = apiUrl;
  }

  getDictionaryList(fetchDataParam: any) {
    return this.http.post<ApiResponse<GridResult<DictionaryData>>>(`${this._apiUrl}dictionary/list`, fetchDataParam);
  }

  createDictionary(data: DictionaryData) {
    return this.http.post<ApiResponse<string>>(`${this._apiUrl}dictionary/create`, data);
  }

  updateDictionary(data: DictionaryData, id: string) {
    return this.http.put<ApiResponse<string>>(`${this._apiUrl}dictionary/${id}/update`, data);
  }

  deleteDictionary(id: string) {
    return this.http.delete<ApiResponse<string>>(`${this._apiUrl}dictionary/${id}/delete`);
  }
}

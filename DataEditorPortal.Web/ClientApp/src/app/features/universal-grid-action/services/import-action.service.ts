import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { ApiResponse } from 'src/app/shared';
import { ImportHistories, LoadState } from '../models/import';

@Injectable()
export class ImportActionService {
  constructor(private http: HttpClient, @Inject('API_URL') public apiUrl: string) {}

  getImportHistories(gridName: string) {
    return this.http
      .get<ApiResponse<ImportHistories[]>>(`${this.apiUrl}import-data/${gridName}/histories`)
      .pipe(map(res => res.data ?? []));
  }

  getImportTemplate(gridName: string, type: string): Observable<Blob> {
    return this.http.post(`${this.apiUrl}import-data/${gridName}/${type}/download-template`, null, {
      responseType: 'blob'
    });
  }

  getUploadTemplate(file: any, gridName: string, type: string) {
    return this.http
      .post<ApiResponse<any>>(`${this.apiUrl}import-data/${gridName}/${type}/upload-excel-template`, file)
      .pipe(map(res => res.data));
  }

  getImportState(fileId: string, gridName: string) {
    return this.http
      .get<ApiResponse<ImportHistories>>(`${this.apiUrl}import-data/${gridName}/${fileId}/import-status`)
      .pipe(map(res => res.data));
  }

  confirmImport(file: any, gridName: string, type: string) {
    return this.http.post<ApiResponse<LoadState>>(`${this.apiUrl}import-data/${gridName}/${type}/confirm-import`, file);
  }
}

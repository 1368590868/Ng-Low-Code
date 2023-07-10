import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { map } from 'rxjs';
import { ApiResponse } from 'src/app/shared';
import { ImportHistories, InfoList, LoadState } from '../models/import';

@Injectable()
export class ImportActionService {
  constructor(
    private http: HttpClient,
    @Inject('API_URL') public apiUrl: string
  ) {}

  getImportHistories(gridName: string) {
    return this.http
      .get<ApiResponse<ImportHistories[]>>(
        `${this.apiUrl}import-data/${gridName}/histories`
      )
      .pipe(map(res => res.data ?? []));
  }

  getUploadTemplate(file: any, gridName: string, type: string) {
    return this.http
      .post<ApiResponse<any>>(
        `${this.apiUrl}import-data/${gridName}/${type}/upload-excel-template`,
        file
      )
      .pipe(map(res => res.data));
  }

  getImportState(fileId: string, gridName: string) {
    return this.http
      .get<ApiResponse<ImportHistories>>(
        `${this.apiUrl}import-data/${gridName}/${fileId}/import-status`
      )
      .pipe(map(res => res.data));
  }

  confirmImport(file: any, gridName: string, type: string) {
    return this.http.post<ApiResponse<LoadState>>(
      `${this.apiUrl}import-data/${gridName}/${type}/confirm-import`,
      file
    );
  }
}

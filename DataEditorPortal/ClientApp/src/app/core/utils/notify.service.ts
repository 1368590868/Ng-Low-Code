import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { MessageService } from 'primeng/api';
import { Observable, of } from 'rxjs';
import { ApiResponse } from '../models/api-response';

@Injectable({
  providedIn: 'root'
})
export class NotifyService {
  public durationMs = 5000;
  constructor(private messageService: MessageService) {}

  // notifyService
  notifySuccess(summary: string, detail: string) {
    this.messageService.add({
      severity: 'success',
      summary: summary,
      detail: detail,
      life: this.durationMs
    });
  }
  notifyInfo(summary: string, detail: string) {
    this.messageService.add({
      severity: 'info',
      summary: summary,
      detail: detail,
      life: this.durationMs
    });
  }
  notifyWarning(summary: string, detail: string) {
    this.messageService.add({
      severity: 'warn',
      summary: summary,
      detail: detail,
      life: this.durationMs
    });
  }
  notifyError(summary: string, detail: string) {
    this.messageService.add({
      severity: 'error',
      summary: summary,
      detail: detail,
      life: this.durationMs
    });
  }

  notifyErrorInPipe<T>(err: HttpErrorResponse, returnData: T): Observable<T> {
    this.notifyError(err.name || err.statusText, err.message || err.error);
    return of<T>(returnData);
  }

  processErrorInPipe<T>(res: ApiResponse<T>): void {
    if (res.isError && res.responseException?.exceptionMessage) {
      this.notifyError(
        'Operation failed',
        res.responseException?.exceptionMessage
      );
    }
  }
}

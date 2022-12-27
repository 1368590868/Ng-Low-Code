import { Injectable } from '@angular/core';
import { MessageService } from 'primeng/api';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  durationMs = 5000;

  constructor(
    private messageService: MessageService,
  ) { }

  notifySuccess(summary: string, detail: string) {
    this.messageService.add({ severity: 'success', summary: summary, detail: detail, life: this.durationMs });
  }
  notifyInfo(summary: string, detail: string) {
    this.messageService.add({ severity: 'info', summary: summary, detail: detail, life: this.durationMs });
  }
  notifyWarning(summary: string, detail: string) {
    this.messageService.add({ severity: 'warn', summary: summary, detail: detail, life: this.durationMs });
  }
  notifyError(summary: string, detail: string) {
    this.messageService.add({ severity: 'error', summary: summary, detail: detail, life: this.durationMs });
  }

  notifyErrorInPipe<T>(err: any, returnData?: T): Observable<T> {
    console.error(err);
    this.notifyError(err.name || err.statusText, err.message || err.error);
    return of(returnData);
  }
}

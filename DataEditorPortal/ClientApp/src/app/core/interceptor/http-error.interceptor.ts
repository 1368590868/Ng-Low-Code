import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { catchError, EMPTY, Observable, of, tap, throwError } from 'rxjs';
import { NotifyService } from '../utils/notify.service';

@Injectable()
export class HttpErrorInterceptor implements HttpInterceptor {
  constructor(private notifyService: NotifyService) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): any {
    return next.handle(request).pipe(
      catchError(error => {
        if (error instanceof HttpErrorResponse)
          this.notifyService.notifyError(
            error.name || error.statusText,
            error.message || error.error
          );
        return EMPTY;
      })
    );
  }
}

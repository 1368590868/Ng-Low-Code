import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpInterceptor,
  HttpErrorResponse,
  HttpResponse
} from '@angular/common/http';
import { catchError, of, throwError } from 'rxjs';
import { NotifyService } from '../utils/notify.service';

@Injectable()
export class HttpErrorInterceptor implements HttpInterceptor {
  constructor(private notifyService: NotifyService) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): any {
    return next.handle(request).pipe(
      catchError(error => {
        if (error instanceof HttpErrorResponse)
          this.notifyService.notifyError(
            error.error?.responseException?.exceptionTitle ||
              error.statusText ||
              error.name,
            error.error?.responseException?.exceptionMessage || error.message
          );

        if (request.responseType === 'json') {
          return of(
            new HttpResponse({
              body: JSON.stringify(error.error)
            })
          );
        } else {
          return throwError(() => error);
        }
      })
    );
  }
}

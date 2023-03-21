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
import { ConfigDataService } from '../services/config-data.service';

@Injectable()
export class HttpErrorInterceptor implements HttpInterceptor {
  constructor(
    private notifyService: NotifyService,
    private configDataService: ConfigDataService
  ) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): any {
    return next.handle(request).pipe(
      catchError(error => {
        if (error instanceof HttpErrorResponse && error.status !== 440)
          this.notifyService.notifyError(
            error.error?.responseException?.exceptionTitle ||
              error.statusText ||
              error.name,
            error.error?.responseException?.exceptionMessage?.title ||
              error.error?.responseException?.exceptionMessage ||
              error.message
          );

        if (error.status === 401) {
          return of(
            new HttpResponse({
              body: { isError: true }
            })
          );
        }

        if (error.status === 440) {
          this.configDataService.licenseExpiredChange$.next(true);
        }

        if (request.responseType === 'json') {
          return of(
            new HttpResponse({
              body: error.error
            })
          );
        } else {
          return throwError(() => error);
        }
      })
    );
  }
}

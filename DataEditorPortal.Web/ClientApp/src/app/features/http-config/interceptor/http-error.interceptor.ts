import { HttpErrorResponse, HttpHandler, HttpInterceptor, HttpRequest, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, of, throwError } from 'rxjs';
import { ConfigDataService, NotifyService } from 'src/app/shared';

@Injectable()
export class HttpErrorInterceptor implements HttpInterceptor {
  constructor(private notifyService: NotifyService, private configDataService: ConfigDataService) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): any {
    return next.handle(request).pipe(
      catchError(error => {
        if (error instanceof HttpErrorResponse && error.status !== 440) {
          this.notifyService.notifyError(error.statusText || error.name, error.error?.message || error.message);
        }

        if (error.status === 401) {
          return of(
            new HttpResponse({
              body: { code: 401, message: 'Unauthorized' }
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

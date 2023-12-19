import { HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { finalize } from 'rxjs';
import { RequestLogUtility } from 'src/app/shared';

@Injectable()
export class RequestLogInterceptor implements HttpInterceptor {
  constructor(private requestLogUtility: RequestLogUtility) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): any {
    const timestep = Date.now().valueOf();
    this.requestLogUtility.start(timestep);
    return next.handle(request).pipe(
      finalize(() => {
        this.requestLogUtility.end(timestep);
      })
    );
  }
}

import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpInterceptor,
  HttpResponse
} from '@angular/common/http';
import { GlobalLoadingService } from '../services/global-loading.service';
import { filter, tap } from 'rxjs';

@Injectable()
export class globalLoadingInterceptor implements HttpInterceptor {
  constructor(private formLoadingService: GlobalLoadingService) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): any {
    this.formLoadingService.onAdd();
    return next.handle(request).pipe(
      filter(event => event instanceof HttpResponse),
      tap(() => {
        this.formLoadingService.onEnd();
      })
    );
  }
}

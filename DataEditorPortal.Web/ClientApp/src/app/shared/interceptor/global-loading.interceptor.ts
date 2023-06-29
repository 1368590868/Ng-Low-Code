import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpInterceptor
} from '@angular/common/http';
import { GlobalLoadingService } from '../services/global-loading.service';
import { tap } from 'rxjs';

@Injectable()
export class globalLoadingInterceptor implements HttpInterceptor {
  constructor(private formLoadingService: GlobalLoadingService) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): any {
    this.formLoadingService.onAdd();
    return next.handle(request).pipe(
      tap({
        complete: () => {
          this.formLoadingService.onEnd();
        },
        error: () => {
          this.formLoadingService.onEnd();
        }
      })
    );
  }
}

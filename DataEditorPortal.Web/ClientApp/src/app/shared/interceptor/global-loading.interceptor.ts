import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpInterceptor
} from '@angular/common/http';
import { GlobalLoadingService } from '../services/global-loading.service';
import { finalize } from 'rxjs';

@Injectable()
export class globalLoadingInterceptor implements HttpInterceptor {
  constructor(private formLoadingService: GlobalLoadingService) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): any {
    this.formLoadingService.add();
    return next.handle(request).pipe(
      finalize(() => {
        this.formLoadingService.remove();
      })
    );
  }
}

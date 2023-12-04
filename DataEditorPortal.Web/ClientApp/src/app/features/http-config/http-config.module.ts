import { CommonModule } from '@angular/common';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { InjectionToken, ModuleWithProviders, NgModule } from '@angular/core';
import { Router } from '@angular/router';
import { AuthRouterGuard, UserService } from 'src/app/shared';
import { HttpErrorInterceptor } from 'src/app/shared/interceptor/http-error.interceptor';
import { RequestLogInterceptor } from 'src/app/shared/interceptor/request-log.interceptor';
import { WinAuthInterceptor } from 'src/app/shared/interceptor/win-auth.interceptor';

interface AuthGuard {
  canActivate(): boolean;
}

export const AUTH_GUARD_TOKEN = new InjectionToken<AuthGuard>('AUTH_GUARD');
@NgModule({
  declarations: [],
  imports: [CommonModule, HttpClientModule]
})
export class HttpConfigModule {
  static forRoot(type: string): ModuleWithProviders<HttpConfigModule> {
    switch (type) {
      case 'windows': {
        return {
          ngModule: HttpConfigModule,
          providers: [
            {
              provide: AUTH_GUARD_TOKEN,
              useClass: AuthRouterGuard,
              deps: [UserService, Router]
            },
            {
              provide: HTTP_INTERCEPTORS,
              useClass: WinAuthInterceptor,
              multi: true
            },
            {
              provide: HTTP_INTERCEPTORS,
              useClass: RequestLogInterceptor,
              multi: true
            },
            {
              provide: HTTP_INTERCEPTORS,
              useClass: HttpErrorInterceptor,
              multi: true
            }
          ]
        };
      }

      default: {
        return {
          ngModule: HttpConfigModule,
          providers: []
        };
      }
    }
  }
}

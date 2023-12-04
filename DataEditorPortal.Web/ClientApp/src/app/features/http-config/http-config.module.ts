import { CommonModule } from '@angular/common';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { InjectionToken, ModuleWithProviders, NgModule } from '@angular/core';
import {
  MsalBroadcastService,
  MsalGuard,
  MsalInterceptor,
  MsalModule,
  MsalService
} from '@azure/msal-angular';
import {
  IPublicClientApplication,
  MsalGuardConfiguration,
  MsalInterceptorConfiguration
} from './azuread-config';
import { HttpErrorInterceptor } from './interceptor/http-error.interceptor';
import { RequestLogInterceptor } from './interceptor/request-log.interceptor';
import { WinAuthInterceptor } from './interceptor/win-auth.interceptor';

interface LoginGuard {
  canActivate(): boolean;
}

export type AuthType = 'AzureAd' | 'Windows';

export const LOGIN_GUARD = new InjectionToken<LoginGuard>('');
export const LOGIN_ENV = new InjectionToken<string>('windows');
@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    HttpClientModule,
    MsalModule.forRoot(
      IPublicClientApplication,
      MsalGuardConfiguration,
      MsalInterceptorConfiguration
    )
  ]
})
export class HttpConfigModule {
  static forRoot(type: AuthType): ModuleWithProviders<HttpConfigModule> {
    switch (type) {
      case 'Windows': {
        return {
          ngModule: HttpConfigModule,
          providers: [
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
            },
            {
              provide: LOGIN_ENV,
              useValue: 'Windows'
            },
            {
              provide: LOGIN_GUARD,
              useFactory: () => {
                return {
                  canActivate(): boolean {
                    return true;
                  }
                };
              }
            }
          ]
        };
      }

      case 'AzureAd': {
        return {
          ngModule: HttpConfigModule,
          providers: [
            {
              provide: HTTP_INTERCEPTORS,
              useClass: MsalInterceptor,
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
            },
            {
              provide: LOGIN_GUARD,
              useClass: MsalGuard
            },
            {
              provide: LOGIN_ENV,
              useValue: 'AzureAd'
            },
            MsalService,
            MsalGuard,
            MsalBroadcastService
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

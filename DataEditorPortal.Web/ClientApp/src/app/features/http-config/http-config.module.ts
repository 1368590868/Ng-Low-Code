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
  BrowserCacheLocation,
  InteractionType,
  LogLevel,
  PublicClientApplication
} from '@azure/msal-browser';
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
      new PublicClientApplication({
        auth: {
          clientId: '59befac2-4643-476c-a946-c7f31c80b37f',
          redirectUri: '/',
          postLogoutRedirectUri: window.location.origin + '/'
        },
        cache: {
          cacheLocation: BrowserCacheLocation.LocalStorage,
          storeAuthStateInCookie: true
        },
        system: {
          loggerOptions: {
            logLevel: LogLevel.Verbose,
            loggerCallback: (level, message, containsPii) => {
              if (containsPii) {
                return;
              }
              switch (level) {
                case LogLevel.Error:
                  console.error(message);
                  return;
                case LogLevel.Info:
                  console.info(message);
                  return;
                case LogLevel.Verbose:
                  console.log(message);
                  return;
                case LogLevel.Warning:
                  console.warn(message);
                  return;
              }
            },
            piiLoggingEnabled: false
          }
        }
      }),
      {
        interactionType: InteractionType.Redirect
      },
      {
        interactionType: InteractionType.Redirect,
        protectedResourceMap: new Map([
          ['https://10.10.120.246:44316/api/site/settings', null],
          ['https://10.10.120.246:44316/api/site/env', null],
          [
            'https://10.10.120.246:44316/api/User/GetLoggedInUser',
            ['api://59befac2-4643-476c-a946-c7f31c80b37f/user.full']
          ],
          [
            'https://10.10.120.246:44316/api/site/menus',
            ['api://59befac2-4643-476c-a946-c7f31c80b37f/user.full']
          ]
        ])
      }
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

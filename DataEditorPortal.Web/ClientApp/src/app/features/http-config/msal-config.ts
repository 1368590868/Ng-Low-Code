import { Injector } from '@angular/core';
import {
  BrowserCacheLocation,
  InteractionType,
  LogLevel,
  PublicClientApplication
} from '@azure/msal-browser';

export const IPublicClientFactory = (injector: Injector) => {
  const clientId = injector.get('MSAL_INSTANCE_CONFIG').clientId;
  return new PublicClientApplication({
    auth: {
      clientId,
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
  });
};

export const MsalGuardConfiguration: any = {
  interactionType: InteractionType.Redirect
};

export const MsalInterceptorCFactory: any = (injector: Injector) => {
  const apiUrl = injector.get('API_URL');
  const clientId = injector.get('MSAL_INSTANCE_CONFIG').clientId;

  return {
    interactionType: InteractionType.Redirect,
    protectedResourceMap: new Map([
      [`${apiUrl}site/settings`, null],
      [`${apiUrl}site/env`, null],
      [`${apiUrl}*`, [`api://${clientId}/user.full`]]
    ])
  };
};

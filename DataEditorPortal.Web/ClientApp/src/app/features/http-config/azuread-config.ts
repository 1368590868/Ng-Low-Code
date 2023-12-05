import {
  BrowserCacheLocation,
  InteractionType,
  LogLevel,
  PublicClientApplication
} from '@azure/msal-browser';

export const IPublicClientApplication = (clientId: string) => {
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

export const MsalInterceptorConfiguration: any = (
  apiUrl: string,
  clientId: string
) => {
  console.log(window.location.origin);
  let newApiUrl = '';
  if (apiUrl.length < 5) {
    newApiUrl = window.location.origin;
  } else {
    newApiUrl = apiUrl.replace('api/', '');
  }
  console.log(newApiUrl);
  return {
    interactionType: InteractionType.Redirect,
    protectedResourceMap: new Map([
      [`${apiUrl}site/settings`, null],
      [`${apiUrl}site/env`, null],
      [`${apiUrl}*`, [`api://${clientId}/user.full`]]
    ])
  };
};

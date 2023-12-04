import {
  BrowserCacheLocation,
  InteractionType,
  LogLevel,
  PublicClientApplication
} from '@azure/msal-browser';

export const IPublicClientApplication = new PublicClientApplication({
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
});

export const MsalGuardConfiguration: any = {
  interactionType: InteractionType.Redirect
};

export const MsalInterceptorConfiguration: any = {
  interactionType: InteractionType.Redirect,
  protectedResourceMap: new Map([
    ['https://10.10.120.246:44316/api/site/settings', null],
    ['https://10.10.120.246:44316/api/site/env', null],
    [
      'https://10.10.120.246:44316/api/*',
      ['api://59befac2-4643-476c-a946-c7f31c80b37f/user.full']
    ]
  ])
};

import { enableProdMode, StaticProvider } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

export function getBaseUrl() {
  return document.getElementsByTagName('base')[0].href;
}

const providers: StaticProvider[] = [
  { provide: 'BASE_URL', useFactory: getBaseUrl, deps: [] }
];

if (environment.production) {
  enableProdMode();
  providers.push(
    {
      provide: 'API_URL',
      useFactory: () => {
        return `${getBaseUrl()}api/`;
      },
      deps: []
    },
    {
      provide: 'MSAL_INSTANCE_CONFIG',
      useFactory: () => {
        return (window as any).MSAL_INSTANCE_CONFIG;
      }
    }
  );
} else {
  providers.push(
    {
      provide: 'API_URL',
      useFactory: () => {
        return `${environment.apiHost}api/`;
      },
      deps: []
    },
    {
      provide: 'MSAL_INSTANCE_CONFIG',
      useFactory: () => {
        return environment.MSAL_INSTANCE_CONFIG;
      }
    }
  );
}

platformBrowserDynamic(providers)
  .bootstrapModule(AppModule)
  .catch(err => console.error(err));

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
  providers.push({
    provide: 'API_URL',
    useFactory: () => {
      return `${getBaseUrl()}api/`;
    },
    deps: []
  });
} else {
  providers.push({
    provide: 'API_URL',
    useFactory: () => {
      return `${environment.apiHost}api/`;
    },
    deps: []
  });
}

platformBrowserDynamic(providers)
  .bootstrapModule(AppModule)
  .catch(err => console.error(err));

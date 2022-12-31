import { StaticProvider } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
export function getBaseUrl() {
  return document.getElementsByTagName('base')[0].href;
}

const providers: StaticProvider[] = [
  { provide: 'BASE_URL', useFactory: getBaseUrl, deps: [] }
];

providers.push({
  provide: 'API_URL',
  useValue: 'https://dsm.ilicie.cc:42282/api/',
  deps: []
});

platformBrowserDynamic(providers)
  .bootstrapModule(AppModule)
  .catch(err => console.error(err));

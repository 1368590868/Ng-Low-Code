import { enableProdMode, StaticProvider } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { AppModule } from './app/app.module';
import { environment } from './environments/environment';


export function getBaseUrl() {
  return document.getElementsByTagName('base')[0].href;
}
export function getApiUrl() {
  return document.getElementsByTagName('base')[0].href + 'api/';
}

const providers: StaticProvider[] = [
  { provide: 'BASE_URL', useFactory: getBaseUrl, deps: [] },
];

if (environment.production) {
  enableProdMode();
  providers.push({ provide: 'API_URL', useFactory: getApiUrl, deps: [] });
} else {
  //providers.push({ provide: 'API_URL', useValue: 'https://localhost:44310/api/', deps: [] });
  providers.push({ provide: 'API_URL', useValue: 'https://10.10.120.246:44311/api/', deps: [] });
}

platformBrowserDynamic(providers).bootstrapModule(AppModule)
  .catch(err => console.log(err));

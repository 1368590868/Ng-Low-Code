import { Injectable } from '@angular/core';
import * as qs from 'qs';

@Injectable({
  providedIn: 'root'
})
export class UrlParamsService {
  public initParams!: any;

  getInitParams(name: string) {
    const urlParams = qs.parse(window.location.search, {
      ignoreQueryPrefix: true
    });

    if (Object.keys(urlParams).length > 0 && urlParams['n'] === name) {
      if (urlParams['p']) urlParams['p'] = qs.parse(urlParams['p'] as string);
      this.initParams = urlParams;
      console.log(urlParams);
      return urlParams;
    }
    return null;
  }

  getIdFilter(dataKey: string) {
    if (this.initParams && this.initParams['p']) {
      return {
        [dataKey]: [
          {
            value: this.initParams['p'][dataKey],
            matchMode: 'startsWith',
            operator: 'and',
            field: dataKey
          }
        ]
      };
    }
    return null;
  }

  getTableSelection(dataKey: string) {
    console.log(this.initParams['p']);

    if (
      this.initParams &&
      this.initParams['p'] &&
      Array.isArray(this.initParams['p']['select'])
    ) {
      return this.initParams['p']['select'].map(item => ({ [dataKey]: item }));
    }
    return [];
  }

  clearInitParams() {
    this.initParams = null;

    let url = window.location.href;
    if (url.indexOf('?') !== -1) {
      url = url.substring(0, url.indexOf('?'));
    }
    window.history.replaceState({}, document.title, url);
  }
}

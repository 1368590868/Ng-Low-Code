import { Inject, Injectable } from '@angular/core';
import * as qs from 'qs';

interface UrlParamsType {
  action: string;
  name: string;
  payload?: any;
}

@Injectable({
  providedIn: 'root'
})
export class UrlParamsService {
  public initParams!: UrlParamsType | null;
  public _config: any;

  constructor(@Inject('GRID_ACTION_CONFIG') public config: any) {}

  getInitParams(name: string, dataKey: any) {
    const urlParams = qs.parse(window.location.search, {
      ignoreQueryPrefix: true
    });

    if (
      Object.keys(urlParams).length > 0 &&
      urlParams['a'] &&
      urlParams['n'] === name &&
      dataKey
    ) {
      if (urlParams['p']) urlParams['p'] = qs.parse(urlParams['p'] as string);

      const actionConfig = this.config.find(
        (x: any) => x.name === urlParams['a']
      );
      const payload = urlParams['p'] as string | qs.ParsedQs;

      if (actionConfig?.requireGridRowSelected) {
        if (!payload || (typeof payload !== 'string' && !payload[dataKey])) {
          this.clearUrlParams();
          return null;
        }
      }
      this.initParams = {
        action: <string>urlParams['a'],
        name: <string>urlParams['n'],
        payload: urlParams['p']
      };

      this.clearUrlParams();

      return this.initParams;
    }
    return null;
  }

  clearUrlParams() {
    let url = window.location.href;
    if (url.indexOf('?') !== -1) {
      url = url.substring(0, url.indexOf('?'));
    }
    window.history.replaceState({}, document.title, url);
  }

  getIdFilter(dataKey: string) {
    if (this.initParams && this.initParams.payload && dataKey) {
      return {
        [dataKey]: [
          {
            value: this.initParams.payload[dataKey],
            matchMode: 'equals',
            field: dataKey
          }
        ]
      };
    }
    return null;
  }

  getTableSelection(dataKey: string) {
    if (
      this.initParams &&
      this.initParams.payload &&
      dataKey &&
      Array.isArray(this.initParams.payload[dataKey])
    ) {
      return this.initParams.payload[dataKey].map((item: any) => ({
        [dataKey]: item
      }));
    }
    return [];
  }

  clearInitParams() {
    this.initParams = null;
  }
}

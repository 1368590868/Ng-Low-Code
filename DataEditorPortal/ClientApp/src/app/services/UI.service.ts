import { Injectable, Inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AppDataService } from './app-data.service';
import { map } from 'rxjs/operators';
import { ConfirmationService } from "primeng/api";

@Injectable()

export class UIService {

  public _apiUrl: string;



  constructor(private http: HttpClient, 
    @Inject('API_URL') apiUrl: string,
    private appDataService: AppDataService) {
    this._apiUrl = apiUrl;
  }

  // get UI config
  getMenuConfig() {
    return this.http.get('../../assets/menu.json')
  }

  getSiteVersion() {
    return this.http.get<any>(this._apiUrl + 'SiteUI/GetSiteVersion');
  }

  
  getSearchParameters(key: string, type: string) {
    console.log('searchservice key', key);     
    return this.http.get(this._apiUrl + 'SiteUI/GetSearchConfig?type=' + type + '&key=' + key);
  }

  getReportParameters(key: string, type: string) {
    console.log('getReportParameters key', key);     
    return this.http.get(this._apiUrl + 'SiteUI/GetReportConfig?type=' + type + '&key=' + key);
  }
  
  getNavigation(key: string) {
    console.log('getNavigation key', key);     
    return this.http.get(this._apiUrl + 'SiteUI/GetSearchNavigationConfig?key=' + key);
  }

  

  getSearchDropdowns(searchConfig: any)
  {
    console.log('getsearchdropdown', searchConfig); 
    return this.http.post<any>(this._apiUrl + 'SiteUI/GetDropdownOptions', searchConfig);     
  } 

  
  getLookups(key: any, filter?: any)
  {
    console.log('getLookups', key); 
    return this.http.get<any>(this._apiUrl + 'SiteUI/GetLookups?key=' + key + '&filter=' + filter);     
  } 

  getEnvironment()
  {
    console.log('getEnvironment'); 
    return this.http.get<any>(this._apiUrl + 'SiteUI/GetEnvironment');     
  }
  
  addSiteVisitLog(section: string, action: string, data: any)
  {

    
    var param = {
      Param: JSON.stringify(data),
      Section: section, 
      Action: action 
    };

     this.http.post<any>(this._apiUrl + 'SiteUI/AddSiteVisitLog', param).subscribe();     
  }

  
  getSavedSearches(configName: string)
  {
    console.log('getSavedSearches'); 
    return this.http.get<any>(this._apiUrl + 'SiteUI/FetchSavedSearch?configName=' + configName);     
  }

  
  getSavedSearchesNav(configName: string)
  {
    console.log('getSavedSearches'); 
    return this.http.get<any>(this._apiUrl + 'SiteUI/FetchSavedSearchNav?configName=' + configName);     
  }
  getSavedSearchesDetail(id: string)
  {
    console.log('getSavedSearches'); 
    return this.http.get<any>(this._apiUrl + 'SiteUI/FetchSavedSearchDetail?id=' + id);     
  }

  
  saveSearchAdd (data: any)
  {
    console.log('saveData', data); 
    var param = {
      DataJSON: JSON.stringify(data)
    };

    return this.http.post<any>(`${this._apiUrl}SiteUI/AddSavedSearch`, param).pipe(
      map(e => e as any)
    );

  }

}

@Injectable()
export class UIConfirmService {
  constructor(private confirmationService: ConfirmationService) {}

  confirm({
    message = "Are you sure that you want to proceed?",
    header = "Confirmation",
    icon = "pi pi-exclamation-triangle"
  } = {}): Promise<boolean> {
    return new Promise(resolve => {
      console.log(
        this.confirmationService.confirm({
          message,
          header,
          icon,
          accept: () => {
            resolve(true);
          },
          reject: () => {
            resolve(false);
          }
        })
      );
    });
  }
}

import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { distinctUntilChanged, map, Observable, startWith, tap } from 'rxjs';
import { ApiResponse } from '../models/api-response';

@Injectable({
  providedIn: 'root'
})
export class NgxFormlyService {
  public _apiUrl: string;
  constructor(private http: HttpClient, @Inject('API_URL') apiUrl: string) {
    this._apiUrl = apiUrl;
  }

  getLookup(id: string, data?: any): Observable<any[]> {
    return this.http
      .post<ApiResponse<any[]>>(
        `${this._apiUrl}lookup/options/${id}`,
        data || {}
      )
      .pipe(map(res => res.result || []));
  }

  initFieldOptions(field: any, data?: any) {
    if (field.props && field.props['optionLookup']) {
      // get lookups from server
      this.getLookup(field.props['optionLookup'], data)
        .pipe(
          tap(result => {
            if (field.props) {
              field.props.options = result;
              const exist = !result.find(
                o => o.value === field.formControl?.value
              );
              if (exist) field.formControl?.setValue(null);
            }
          })
        )
        .subscribe();
    }
  }

  initDependOnFields(field: any) {
    const model: any = {};

    field.props['dependOnFields'].forEach((key: string) => {
      const control = field.parent.get(key).formControl;
      model[key] = control.value;
    });
    this.initFieldOptions(field, model);

    field.props['dependOnFields'].forEach((key: string) => {
      const control = field.parent.get(key).formControl;
      control?.valueChanges
        .pipe(
          distinctUntilChanged(),
          tap(val => {
            model[key] = val;
            this.initFieldOptions(field, model);
          })
        )
        .subscribe();
    });
  }
}

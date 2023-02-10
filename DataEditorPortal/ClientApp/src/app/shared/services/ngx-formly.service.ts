import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { distinctUntilChanged, map, Observable, tap, debounceTime } from 'rxjs';
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
        `${this._apiUrl}lookup/${id}/options`,
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
              const notExist =
                field.formControl?.value &&
                !result.find(o => o.value === field.formControl?.value);
              if (notExist) {
                field.formControl?.setValue(null);
              }
            }
          })
        )
        .subscribe();
    }
  }

  initDependOnFields(field: any) {
    const model: any = {};

    field.props['dependOnFields'].forEach((key: string) => {
      if (field.key === key) return;
      const control = field.parent.get(key).formControl;
      model[key] = control.value || (field.type === 'select' ? '' : []);
    });

    field.props['dependOnFields'].forEach((key: string) => {
      if (field.key === key) return;
      const control = field.parent.get(key).formControl;
      control?.valueChanges
        .pipe(
          distinctUntilChanged(),
          debounceTime(300),
          tap(val => {
            model[key] = val || (field.type === 'select' ? '' : []);
            this.initFieldOptions(field, model);
          })
        )
        .subscribe();
    });
  }
}

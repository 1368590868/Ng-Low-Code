import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { FormControl } from '@angular/forms';
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
              if (field.type === 'select') {
                const control = field.formControl as FormControl;
                if (control.value) {
                  const notExist = !result.find(o => o.value === control.value);
                  if (notExist) {
                    control.setValue(null);
                  } else {
                    control.setValue(control.value, {
                      emitEvent: false
                    });
                  }
                }
              }
              if (field.type === 'multiSelect' && field.formControl?.value) {
                const control = field.formControl as FormControl;
                if (control.value) {
                  let data = control.value || [];
                  data = data.filter((x: any) =>
                    result.find(o => o.value === x)
                  );
                  field.formControl.setValue(data);
                }
              }
            }
          })
        )
        .subscribe();
    }
  }

  initDependOnFields(field: any) {
    const model: any = {};

    // calculate values for depends on fields
    field.props['dependOnFields'].forEach((key: string) => {
      if (field.key === key) return;
      const dependOnField = field.parent.get(key);
      model[key] = dependOnField.formControl.value;
    });

    // load lookups for field.
    this.initFieldOptions(field, model);

    // subscribe depends on fields value changes.
    field.props['dependOnFields'].forEach((key: string) => {
      if (field.key === key) return;
      const dependOnField = field.parent.get(key);
      dependOnField.formControl?.valueChanges
        .pipe(
          distinctUntilChanged(),
          debounceTime(300),
          tap(val => {
            model[key] = val;
            this.initFieldOptions(field, model);
          })
        )
        .subscribe();
    });
  }
}

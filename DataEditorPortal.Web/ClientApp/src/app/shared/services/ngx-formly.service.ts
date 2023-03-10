import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { AbstractControl, FormControl, FormGroup } from '@angular/forms';
import { distinctUntilChanged, map, Observable, tap, debounceTime } from 'rxjs';
import { ApiResponse } from '../models/api-response';
import { evalExpression, evalStringExpression } from '../utils';

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
    if (field.props && field.props['optionsLookup']) {
      // get lookups from server
      this.getLookup(field.props['optionsLookup'], data)
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
                  }
                }
              }
              if (field.type === 'multiSelect' && field.formControl?.value) {
                const control = field.formControl as FormControl;
                if (control.value) {
                  const data = control.value || [];
                  const filteredData = data.filter(
                    (x: any) => !!result.find(o => o.value === x)
                  );
                  if (filteredData.length < data.length)
                    field.formControl.setValue(filteredData);
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

  initValidators(field: any) {
    if (Array.isArray(field.validatorConfig)) {
      const validators: any = { validation: [] };
      field.validatorConfig.forEach(
        (x: string | { expression: string; message: string }) => {
          if (typeof x === 'string') validators.validation.push(x);
          else if (x.expression && x.message) {
            validators.customValidation = {
              expression: (control: AbstractControl, field: any, msg: any) => {
                const form = control.root as FormGroup;
                const model = { ...form.value };
                model[field.key] = control.value;
                return evalExpression(
                  evalStringExpression(x.expression, ['form', 'model']),
                  control,
                  [form, model]
                );
              },
              message: x.message
            };
          }
        }
      );
      field.validators = validators;
      field.validatorConfig = undefined;
    }
  }
}
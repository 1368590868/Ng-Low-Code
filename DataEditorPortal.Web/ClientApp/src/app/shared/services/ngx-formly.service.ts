import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { AbstractControl, FormControl, FormGroup } from '@angular/forms';
import {
  distinctUntilChanged,
  map,
  Observable,
  tap,
  debounceTime,
  Subject,
  takeUntil
} from 'rxjs';
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

  private getLookup(id: string, data?: any): Observable<any[]> {
    return this.http
      .post<ApiResponse<any[]>>(
        `${this._apiUrl}lookup/${id}/options`,
        data || {}
      )
      .pipe(map(res => res.data || []));
  }

  initFieldOptions(field: any, data?: any) {
    if (field.props && field.props.optionsLookup) {
      // get lookups from server
      field.props.options = [];
      field.props.emptyMessage = 'Loading...';
      this.getLookup(field.props.optionsLookup.id, data)
        .pipe(
          tap(result => {
            if (field.props) {
              field.props.emptyMessage = 'No records found';
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
              field.options.detectChanges(field);
            }
          })
        )
        .subscribe();
    }
  }

  getFieldLookupOnInit(destroy$: Subject<void>) {
    return (f: any) => {
      if (f.props && f.props.optionsLookup) {
        const $deps = f.props.optionsLookup.deps;
        if ($deps && $deps.length > 0) {
          const model: any = {};

          // calculate values for depends on fields
          $deps.forEach((key: string) => {
            if (f.key === key) return;
            const dependOnField = f.parent.get(key);
            model[key] = dependOnField.formControl.value;
          });

          // load lookups for field.
          this.initFieldOptions(f, model);

          // subscribe depends on fields value changes.
          const subject = new Subject<any>();
          const observable = subject as Observable<any>;
          observable
            .pipe(
              debounceTime(100),
              distinctUntilChanged(),
              takeUntil(destroy$)
            )
            .subscribe(({ f, model }) => {
              this.initFieldOptions(f, model);
            });

          $deps.forEach((key: string) => {
            if (f.key === key) return;
            const dependOnField = f.parent.get(key);
            dependOnField.formControl?.valueChanges
              .pipe(
                debounceTime(100),
                distinctUntilChanged(),
                takeUntil(destroy$),
                tap(val => {
                  model[key] = val;
                  subject.next({ f, model });
                })
              )
              .subscribe();
          });
        } else {
          this.initFieldOptions(f);
        }
      }
    };
  }

  initFieldLookup(field: any, destory$: Subject<void>) {
    const onInit = this.getFieldLookupOnInit(destory$);
    // set onInit hooks
    this.setFieldHook(field, 'onInit', onInit);
  }

  initValidators(field: any, destory$: Subject<void>) {
    if (Array.isArray(field.validatorConfig)) {
      const validators: any = { validation: [] };
      let $deps: string[] = [];
      field.validatorConfig.forEach(
        (x: string | { expression: string; message: string }) => {
          if (typeof x === 'string')
            validators.validation.push(x); // pre-defined simple validators
          else if (x.expression && x.message) {
            // custom validators using javascript expression
            // add custom validation to validators
            validators.customValidation = {
              expression: (control: AbstractControl, field: any, msg: any) => {
                const form = control.root as FormGroup;
                const model = { ...form.value };
                model[field.key] = control.value;
                return evalExpression(
                  evalStringExpression(x.expression, ['$form', '$model']),
                  control,
                  [form, model]
                );
              },
              message: x.message
            };

            // regex to match the dependencies fields
            $deps = [
              ...x.expression.matchAll(/\$model[.]{1}([a-zA-Z_]\w*){1}/g)
            ]
              .map(match => match[1]) // get the field name
              .filter((value, index, array) => array.indexOf(value) === index) // distinct
              .filter(value => value !== field.key); // exclude current field itself
          }
        }
      );
      field.validators = validators;
      field.validatorConfig = undefined;

      if ($deps.length > 0) {
        // subscribe $deps value change to trigger validation
        const onInit = (f: any) => {
          $deps.forEach(key => {
            const $dep = f.parent.get(key);
            if ($dep) {
              $dep.formControl.valueChanges
                .pipe(takeUntil(destory$))
                .subscribe(() => {
                  setTimeout(() => f?.formControl?.updateValueAndValidity());
                });
            }
          });
        };

        // set onInit hooks
        this.setFieldHook(field, 'onInit', onInit);
      }
    }
  }

  private setFieldHook(field: any, name: string, callback: (f: any) => void) {
    if (field.hooks) {
      if (field.hooks[name]) {
        const prevCallback = field.hooks[name];
        field.hooks[name] = (f: any) => {
          prevCallback(f);
          callback(f);
        };
      } else {
        field.hooks[name] = callback;
      }
    } else {
      field.hooks = { [name]: callback };
    }
  }
}

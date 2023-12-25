import { HttpClient } from '@angular/common/http';
import {
  CUSTOM_ELEMENTS_SCHEMA,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnInit,
  forwardRef
} from '@angular/core';
import { AbstractControl, ControlValueAccessor, FormGroup, NG_VALUE_ACCESSOR, ValidationErrors } from '@angular/forms';
import { FieldType, FieldTypeConfig, FormlyFieldConfig, FormlyFieldProps, FormlyFormOptions } from '@ngx-formly/core';
import { map } from 'rxjs';

@Component({
  selector: 'app-gps-locator',
  templateUrl: './gps-locator.component.html',
  styleUrls: ['./gps-locator.component.scss'],
  providers: [
    {
      provide: CUSTOM_ELEMENTS_SCHEMA,
      useExisting: GPSLocatorComponent,
      multi: true
    },
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => GPSLocatorComponent),
      multi: true
    }
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GPSLocatorComponent implements ControlValueAccessor {
  @Input()
  set dirty(val: boolean) {
    if (val) this.fields.forEach(x => x.formControl?.markAsDirty());
    else this.fields.forEach(x => x.formControl?.markAsPristine());
  }

  _required = false;
  @Input()
  get required() {
    return this._required;
  }
  set required(val: boolean) {
    this._required = val;
    this.fields.forEach(x => {
      if (x.props) x.props.required = val;
    });
  }
  @Input() serviceConfig!: ServiceConfig;

  @Input() label!: string;

  _value: any;
  @Input()
  set value(val: any) {
    if (val && val !== 'error') {
      this.model = { ...this.model, ...val };
      this.changeDetectorRef.markForCheck();
    }
    this._value = val;
  }
  @Input() formControl!: AbstractControl;

  form = new FormGroup({});
  options: FormlyFormOptions = {};

  onChange?: any;
  onTouch?: any;
  disabled = false;
  model: any = {};
  resultMapping!: any;

  visible = false;
  dialogData: any[] = [];

  fields: FormlyFieldConfig[] = [
    {
      key: 'beginX',
      type: 'inputNumber',
      className: 'left-columns',
      props: {
        label: 'Begin GPS',
        required: this.required
      }
    },
    {
      key: 'beginY',
      className: 'right-columns',
      type: 'inputNumber',
      props: {
        required: this.required
      }
    },
    {
      key: 'endX',
      type: 'inputNumber',
      className: 'left-columns',
      props: {
        label: 'End GPS',
        required: this.required
      }
    },
    {
      key: 'endY',
      type: 'inputNumber',
      className: 'right-columns',
      props: {
        required: this.required
      }
    }
  ];

  constructor(private changeDetectorRef: ChangeDetectorRef, private http: HttpClient) {}

  writeValue(value: any): void {
    this.value = value;
  }
  registerOnChange(fn: any): void {
    this.onChange = fn;
  }
  registerOnTouched(fn: any): void {
    this.onTouch = fn;
  }
  setDisabledState?(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  onCustomService(api: string, method: 'get' | 'post', params: any[]): any {
    try {
      const newParams = params.map(x => {
        return { name: x.name, value: this.model[x.value] };
      });
      const httpParams: any = {};
      newParams.forEach(x => {
        httpParams[x.name] = x.value;
      });
      if (method === 'get') {
        // pipe is mock data
        return this.http.get(api, { params: httpParams }).pipe(
          map(() => [
            { name1: 3, name2: 4 },
            { name1: 6, name2: 8 }
          ])
        );
      } else {
        // pipe is mock data
        return this.http.post(api, httpParams).pipe(map(() => ({ name1: 3, name2: 4 })));
      }
    } catch {
      throw new Error('Invalid service config');
    }
  }

  modelChange(val: any) {
    if (val?.beginX && val?.beginY && val?.endX && val?.endY) {
      this.onChange?.(val);
    }
  }

  onLookupLines() {
    const { apiAddress, method, params, resultMapping } = this.serviceConfig;
    this.resultMapping = resultMapping;
    if (this.form.valid) {
      this.onCustomService(apiAddress, method, params).subscribe((res: any) => {
        if (Array.isArray(res)) {
          if (res.length > 1) {
            this.openDialog();
            this.dialogData = res;
            this.changeDetectorRef.detectChanges();
          } else {
            this.changeOutFieldData(res);
          }
        } else {
          this.changeOutFieldData(res);
        }
      });
    } else {
      this.fields.forEach(x => x.formControl?.markAsDirty());
    }
  }

  // Change the external filed value by mapping
  changeOutFieldData(val: any) {
    console.log(val);
  }

  onOk() {
    this.changeOutFieldData('table selected data');
  }

  openDialog() {
    this.visible = true;
  }

  onCancel() {
    this.visible = false;
  }

  onShowLines() {
    console.log('onShowLines');
  }
}

interface ServiceConfig {
  apiAddress: string;
  method: 'get' | 'post';
  params: { [key: string]: any }[];
  resultMapping: { [key: string]: any }[];
}

@Component({
  selector: 'app-formly-gps-locator',
  template: `
    <app-gps-locator
      [formControl]="formControl"
      [formlyAttributes]="field"
      [dirty]="formControl.dirty"
      [required]="props.required || false"
      [serviceConfig]="props.serviceConfig"></app-gps-locator>
  `,
  styles: [
    `
      :host {
        width: 100% !important;
      }
    `
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FormlyFieldGPSLocatorComponent
  extends FieldType<
    FieldTypeConfig<
      FormlyFieldProps & {
        dirty: boolean;
        serviceConfig: ServiceConfig;
      }
    >
  >
  implements OnInit
{
  ngOnInit(): void {
    this.field.validation = {
      messages: { required: ' ', errorData: ' ' }
    };
    this.field.formControl.addValidators((control: AbstractControl): ValidationErrors | null => {
      if (control.value === 'error') {
        control.markAsPristine();
        return { errorData: true };
      }
      return null;
    });
  }
}

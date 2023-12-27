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
import { NotifyService } from 'src/app/shared';

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
  @Input() showLinesLabel!: string;
  @Input() showLinesUrl!: string;
  @Input() lookupLinesLabel!: string;

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
  columns: any[] = [];

  visible = false;
  dialogData: any[] = [];
  selection: any = null;

  fields: FormlyFieldConfig[] = [
    {
      key: 'beginLat',
      type: 'inputNumber',
      className: 'left-columns',
      props: {
        label: 'Begin GPS',
        required: this.required,
        maxFractionDigits: 20,
        placeholder: 'Latitude'
      }
    },
    {
      key: 'beginLon',
      className: 'right-columns',
      type: 'inputNumber',
      props: {
        required: this.required,
        maxFractionDigits: 20,
        placeholder: 'Longitude'
      }
    },
    {
      key: 'endLat',
      type: 'inputNumber',
      className: 'left-columns',
      props: {
        label: 'End GPS',
        required: this.required,
        maxFractionDigits: 20,
        placeholder: 'Latitude'
      }
    },
    {
      key: 'endLon',
      type: 'inputNumber',
      className: 'right-columns',
      props: {
        required: this.required,
        maxFractionDigits: 20,
        placeholder: 'Longitude'
      }
    }
  ];

  constructor(
    private changeDetectorRef: ChangeDetectorRef,
    private http: HttpClient,
    private notifyService: NotifyService
  ) {}

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

  onCustomService(api: string, method: string, params: any[] = []): any {
    try {
      const newParams = params.map(x => {
        return { name: x.name, value: this.model[x.value] };
      });
      const httpParams: any = {};
      newParams.forEach(x => {
        httpParams[x.name] = x.value;
      });
      if (method === 'get') {
        return this.http.get(api, { params: httpParams }).pipe(map((res: any) => res.data));
      } else {
        return this.http.post(api, httpParams).pipe(map((res: any) => res.data));
      }
    } catch {
      throw new Error('Invalid service config');
    }
  }

  modelChange(val: any) {
    if (val?.beginLon && val?.beginLat && val?.endLon && val?.endLat) {
      this.onChange?.(val);
    }
  }

  onLookupLines() {
    const { apiAddress, method, paramMapping, resultMapping } = this.serviceConfig;
    this.resultMapping = resultMapping;
    if (this.form.valid) {
      this.onCustomService(apiAddress, method.toLowerCase(), paramMapping).subscribe((res: any) => {
        if (Array.isArray(res)) {
          if (res.length > 1) {
            this.openDialog();
            this.dialogData = res;
            this.columns = resultMapping.map((x: any) => x.name);
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
    const { resultMapping } = this.serviceConfig;
    const data: any = {};
    resultMapping.forEach((x: any) => {
      data[x.value] = val[x.name];
    });

    (this.formControl.parent as FormGroup<any>)?.patchValue(data);
    this.visible = false;
  }

  onRowSelect(event: any) {
    this.selection = event.data;
  }

  onRowUnselect(event: any) {
    this.selection = null;
  }

  onRowCheckBoxClick(event: MouseEvent) {
    event.stopPropagation();
  }

  onOk() {
    if (!this.selection) this.notifyService.notifyWarning('Warning', 'Please select a row');
    else this.changeOutFieldData(this.selection);
  }

  openDialog() {
    this.visible = true;
  }

  onCancel() {
    this.visible = false;
  }

  onShowLines() {
    if (this.showLinesUrl) window.open(this.showLinesUrl, '_blank');
  }
}

interface ServiceConfig {
  apiAddress: string;
  method: 'GET' | 'POST';
  paramMapping: { [key: string]: any }[];
  resultMapping: { [key: string]: any }[];
}

@Component({
  selector: 'app-formly-gps-locator',
  template: `
    <app-gps-locator
      [formControl]="formControl"
      [formlyAttributes]="field"
      [dirty]="formControl.dirty"
      [label]="props.label || ''"
      [required]="props.required || false"
      [serviceConfig]="props.serviceConfig"
      [showLinesLabel]="props.showLinesLabel || 'Show Lines'"
      [showLinesUrl]="props.showLinesUrl || ''"
      [lookupLinesLabel]="props.lookupLinesLabel || 'Lookup Lines'"></app-gps-locator>
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
        label: string;
        serviceConfig: ServiceConfig;
        mappingColumns: { [key: string]: any }[];
        showLinesLabel: string;
        showLinesUrl: string;
        lookupLinesLabel: string;
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

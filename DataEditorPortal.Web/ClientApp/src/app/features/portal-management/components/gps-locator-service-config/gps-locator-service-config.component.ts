import { CUSTOM_ELEMENTS_SCHEMA, ChangeDetectionStrategy, Component, Input, Optional, forwardRef } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, NG_VALUE_ACCESSOR, Validators } from '@angular/forms';
import { FieldType, FieldTypeConfig, FormlyFieldProps } from '@ngx-formly/core';
import { FormLayoutComponent } from '..';

type ParamMapping = { name: string | null; value: string | null };
type FieldMapping = { name: string | null; value: string | null; label: string | null };
type FC<T> = { [P in keyof T]: FormControl<T[P]> };
type ValueModel = {
  apiAddress: string | null;
  method: string;
  paramMapping: ParamMapping[];
  dataField: string | null;
  resultMapping: FieldMapping[];
};

@Component({
  selector: 'app-gps-locator-service-config',
  templateUrl: './gps-locator-service-config.component.html',
  styleUrls: ['./gps-locator-service-config.component.scss'],
  providers: [
    {
      provide: CUSTOM_ELEMENTS_SCHEMA,
      useExisting: GPSLocatorServiceConfigComponent,
      multi: true
    },
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => GPSLocatorServiceConfigComponent),
      multi: true
    }
  ]
})
export class GPSLocatorServiceConfigComponent {
  @Input()
  set value(val: ValueModel) {
    if (!val) {
      this.innerValue = null;
    } else {
      this.innerValue = val;
    }
  }

  constructor(private formBuilder: FormBuilder, @Optional() private formLayout: FormLayoutComponent) {}

  paramMappingOptions = [
    {
      label: 'beginLat',
      value: 'beginLat'
    },
    {
      label: 'beginLon',
      value: 'beginLon'
    },
    {
      label: 'endLat',
      value: 'endLat'
    },
    {
      label: 'endLon',
      value: 'endLon'
    }
  ];

  formItems: { label: string; value: string }[] = [];

  formGroup!: FormGroup<{
    apiAddress: FormControl<string | null>;
    method: FormControl<string>;
    paramMapping: FormArray<FormGroup<FC<ParamMapping>>>;
    dataField: FormControl<string | null>;
    resultMapping: FormArray<FormGroup<FC<FieldMapping>>>;
  }>;

  visible = false;
  onChange?: any;
  onTouch?: any;
  disabled = false;

  innerValue: any = null;
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

  removeConfig() {
    this.visible = false;
    this.innerValue = null;
  }

  showDialog() {
    this.visible = true;
    if (this.innerValue) {
      const newVal = JSON.parse(JSON.stringify(this.innerValue || null)) as ValueModel;
      this.createFormGroup(newVal);
    } else {
      this.createFormGroup();
    }

    // generate form items
    const _items: { label: string; value: string }[] = [];
    this.formLayout?.targetColumns?.forEach(x => {
      if (x.props?.['mappingColumns']) {
        Object.keys(x.props?.['mappingColumns']).forEach(f =>
          _items.push({ label: `${x.key}.${f}`, value: `${x.key}.${f}` })
        );
      } else _items.push({ label: x.key, value: x.key });
    });
    this.formItems = _items;
  }

  onSave() {
    if (!this.onValid()) {
      return;
    }
    const data = this.formGroup.getRawValue();
    this.onChange?.(data);
    this.innerValue = data;
    this.visible = false;
  }

  onValid() {
    this.formGroup.markAllAsTouched();
    return this.formGroup.valid;
  }

  createFormGroup(data?: ValueModel) {
    const paramMapping = data?.paramMapping || [];
    const resultMapping = data?.resultMapping || [];

    const formGroup = this.formBuilder.group({
      apiAddress: this.formBuilder.control(data?.apiAddress || null, Validators.required),
      method: this.formBuilder.control(data?.method || 'GET', { nonNullable: true, validators: Validators.required }),
      paramMapping: this.formBuilder.array(paramMapping.map(x => this.createParamMappingFormGroup(x))),
      dataField: this.formBuilder.control(data?.dataField || null),
      resultMapping: this.formBuilder.array(resultMapping.map(x => this.createFieldMappingFormGroup(x)))
    });

    this.formGroup = formGroup;
  }

  createParamMappingFormGroup(data?: ParamMapping) {
    return this.formBuilder.group({
      name: this.formBuilder.control(data?.name || null, { validators: Validators.required }),
      value: this.formBuilder.control(data?.value || null, { validators: Validators.required })
    });
  }

  createFieldMappingFormGroup(data?: FieldMapping) {
    return this.formBuilder.group({
      name: this.formBuilder.control(data?.name || null, { validators: Validators.required }),
      value: this.formBuilder.control(data?.value || null),
      label: this.formBuilder.control(data?.label || null)
    });
  }

  // param mapping
  get params() {
    return this.formGroup.controls.paramMapping;
  }

  addParam() {
    const param = this.createParamMappingFormGroup();
    this.params.push(param);
  }

  deleteParam(index: number) {
    this.params.removeAt(index);
  }

  // result mapping
  get resultMappings() {
    return this.formGroup.controls.resultMapping;
  }

  addResultMapping() {
    const mapping = this.createFieldMappingFormGroup();
    this.resultMappings.push(mapping);
  }

  deleteResultMapping(index: number) {
    this.resultMappings.removeAt(index);
  }
}

@Component({
  selector: 'app-formly-gps-locator-service-config',
  template: ` <app-gps-locator-service-config
    [formControl]="formControl"
    [formlyAttributes]="field"></app-gps-locator-service-config>`,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FormlyFieldGPSLocatorServiceConfigComponent extends FieldType<FieldTypeConfig<FormlyFieldProps>> {}
FormlyFieldGPSLocatorServiceConfigComponent;

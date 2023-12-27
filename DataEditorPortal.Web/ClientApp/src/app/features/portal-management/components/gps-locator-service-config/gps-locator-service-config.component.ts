import { CUSTOM_ELEMENTS_SCHEMA, ChangeDetectionStrategy, Component, Input, forwardRef } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, NG_VALUE_ACCESSOR, Validators } from '@angular/forms';
import { FieldType, FieldTypeConfig, FormlyFieldProps } from '@ngx-formly/core';
import { DataSourceTableColumn } from '../../models/portal-item';

type FieldMapping = { name: string | null; value: string | null };
type FC<T> = { [P in keyof T]: FormControl<T[P]> };
type ValueModel = {
  apiAddress: string | null;
  method: string;
  paramMapping: FieldMapping[];
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
  @Input()
  set mappingColumns(val: DataSourceTableColumn[]) {
    this.filedMapping = val.map(x => {
      return {
        label: x.columnName,
        value: x.columnName
      };
    });
  }
  filedMapping!: { label: string; value: string }[];
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

  constructor(private formBuilder: FormBuilder) {}

  formGroup!: FormGroup<{
    apiAddress: FormControl<string | null>;
    method: FormControl<string>;
    paramMapping: FormArray<FormGroup<FC<FieldMapping>>>;
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
      paramMapping: this.formBuilder.array(paramMapping.map(x => this.createMappingFormGroup(x))),
      resultMapping: this.formBuilder.array(resultMapping.map(x => this.createMappingFormGroup(x)))
    });

    this.formGroup = formGroup;
  }

  createMappingFormGroup(data?: FieldMapping) {
    return this.formBuilder.group({
      name: this.formBuilder.control(data?.name || null, { validators: Validators.required }),
      value: this.formBuilder.control(data?.value || null, { validators: Validators.required })
    });
  }

  // param mapping
  get params() {
    return this.formGroup.controls.paramMapping;
  }

  addParam() {
    const param = this.createMappingFormGroup();
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
    const mapping = this.createMappingFormGroup();
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
    [formlyAttributes]="field"
    [mappingColumns]="props.mappingColumns || []"></app-gps-locator-service-config>`,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FormlyFieldGPSLocatorServiceConfigComponent extends FieldType<
  FieldTypeConfig<
    FormlyFieldProps & {
      mappingColumns: DataSourceTableColumn[];
    }
  >
> {}
FormlyFieldGPSLocatorServiceConfigComponent;

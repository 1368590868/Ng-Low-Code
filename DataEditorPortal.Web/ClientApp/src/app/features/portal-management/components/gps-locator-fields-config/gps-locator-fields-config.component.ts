import { CUSTOM_ELEMENTS_SCHEMA, ChangeDetectionStrategy, Component, Input, forwardRef } from '@angular/core';
import { FormControl, FormGroup, NG_VALUE_ACCESSOR, Validators } from '@angular/forms';
import { FieldType, FieldTypeConfig, FormlyFieldProps } from '@ngx-formly/core';
import { FormLayoutComponent } from '..';

@Component({
  selector: 'app-gps-locator-fields-config',
  templateUrl: './gps-locator-fields-config.component.html',
  styleUrls: ['./gps-locator-fields-config.component.scss'],
  providers: [
    {
      provide: CUSTOM_ELEMENTS_SCHEMA,
      useExisting: GPSLocatorFieldsConfigComponent,
      multi: true
    },
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => GPSLocatorFieldsConfigComponent),
      multi: true
    }
  ]
})
export class GPSLocatorFieldsConfigComponent {
  @Input()
  set value(val: any) {
    if (!val) {
      this.innerValue = null;
      return;
    }
    this.innerValue = val;
  }

  constructor(private formLayout: FormLayoutComponent) {}

  dbColumns: { label: string; value: string }[] = [];

  formGroup = new FormGroup({
    beginLat: new FormControl(null, Validators.required),
    beginLon: new FormControl(null, Validators.required),
    endLat: new FormControl(null, Validators.required),
    endLon: new FormControl(null, Validators.required)
  });

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
      this.formGroup.setValue(this.innerValue);
    } else {
      this.formGroup.reset();
    }

    // generate dbColumns
    this.dbColumns = this.formLayout?._dbColumns?.map(x => ({ label: x.columnName, value: x.columnName })) || [];
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

    return true;
  }
}

@Component({
  selector: 'app-formly-gps-locator-fields-config',
  template: ` <app-gps-locator-fields-config
    [formControl]="formControl"
    [formlyAttributes]="field"></app-gps-locator-fields-config>`,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FormlyFieldGPSLocatorFieldsConfigComponent extends FieldType<FieldTypeConfig<FormlyFieldProps>> {}

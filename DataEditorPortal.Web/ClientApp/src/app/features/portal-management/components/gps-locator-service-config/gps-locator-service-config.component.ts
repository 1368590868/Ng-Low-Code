import { CUSTOM_ELEMENTS_SCHEMA, ChangeDetectionStrategy, Component, Input, forwardRef } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { FieldType, FieldTypeConfig, FormlyFieldProps } from '@ngx-formly/core';
import { DataSourceTableColumn } from '../../models/portal-item';

@Component({
  selector: 'app-gps-locator-service-config',
  templateUrl: './gps-locator-service-config.component.html',
  styleUrls: ['./gps-locator-service-config.component.scss'],
  providers: [
    {
      provide: CUSTOM_ELEMENTS_SCHEMA,
      useExisting: GpsLocatorServiceConfigComponent,
      multi: true
    },
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => GpsLocatorServiceConfigComponent),
      multi: true
    }
  ]
})
export class GpsLocatorServiceConfigComponent {
  @Input()
  set value(val: any) {
    if (!val) {
      this.innerValue = null;
      return;
    }
    this.innerValue = val;

    const newVal = JSON.parse(JSON.stringify(val || null));
    if (newVal) {
      // this.formControlFrom.setValue(val?.from);
      // this.formControlFromMeasure.setValue(val?.fromMeasure);
      // this.formControlTo.setValue(val?.to);
      // this.formControlToMeasure.setValue(val?.toMeasure);
    }
  }

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
      // this.formControlFrom.setValue(this.innerValue?.from);
      // this.formControlFromMeasure.setValue(this.innerValue?.fromMeasure);
      // this.formControlTo.setValue(this.innerValue?.to);
      // this.formControlToMeasure.setValue(this.innerValue?.toMeasure);
    } else {
      // this.formControlFrom.reset();
      // this.formControlFromMeasure.reset();
      // this.formControlTo.reset();
      // this.formControlToMeasure.reset();
    }
  }

  onSave() {
    if (!this.onValid()) {
      return;
    }
    const data = {
      // from: this.formControlFrom.value,
      // fromMeasure: this.formControlFromMeasure.value,
      // to: this.formControlTo.value,
      // toMeasure: this.formControlToMeasure.value
    };

    // switch (this.locationType) {
    //   case 2: {
    //     data.to = null;
    //     data.toMeasure = null;
    //     break;
    //   }
    // }

    this.onChange?.(data);
    this.innerValue = data;
    this.visible = false;
  }

  onValid() {
    // this.formControlFromMeasure.markAsDirty();
    // this.formControlFrom.markAsDirty();
    // this.formControlToMeasure.markAsDirty();
    // this.formControlTo.markAsDirty();
    // if (!this.formControlFromMeasure.valid || !this.formControlFrom.valid) {
    //   return false;
    // }
    // if (this.locationType === 3 && !this.formControlToMeasure.valid) {
    //   return false;
    // }
    // if (this.locationType === 4) {
    //   if (!this.formControlToMeasure.valid || !this.formControlTo.valid) return false;
    // }
    return true;
  }
}

@Component({
  selector: 'app-formly-gps-locator-service-config',
  template: ` <app-gps-locator-service-config
    [formControl]="formControl"
    [formlyAttributes]="field"></app-gps-locator-service-config>`,
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

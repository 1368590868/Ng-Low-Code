import { CUSTOM_ELEMENTS_SCHEMA, ChangeDetectionStrategy, Component, Input, forwardRef } from '@angular/core';
import { FormControl, NG_VALUE_ACCESSOR, Validators } from '@angular/forms';
import { FieldType, FieldTypeConfig, FormlyFieldProps } from '@ngx-formly/core';
import { DataSourceTableColumn } from '../../models/portal-item';

@Component({
  selector: 'app-location-configuration',
  templateUrl: './location-configuration.component.html',
  styleUrls: ['./location-configuration.component.scss'],
  providers: [
    {
      provide: CUSTOM_ELEMENTS_SCHEMA,
      useExisting: LocationConfigurationComponent,
      multi: true
    },
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => LocationConfigurationComponent),
      multi: true
    }
  ]
})
export class LocationConfigurationComponent {
  onChange?: any;
  onTouch?: any;
  disabled = false;

  formControlFrom: FormControl = new FormControl(null, Validators.required);
  formControlFromMeasure: FormControl = new FormControl(null, Validators.required);
  formControlTo: FormControl = new FormControl(null, Validators.required);
  formControlToMeasure: FormControl = new FormControl(null, Validators.required);

  visible = false;

  @Input() locationType!: number;
  @Input()
  set mappingColumns(val: DataSourceTableColumn[]) {
    this.filedMapping = val.map(x => {
      return {
        label: x.columnName,
        value: x.columnName
      };
    });
  }
  @Input()
  set value(val: any) {
    if (!val) {
      this.innerValue = null;
      return;
    }
    this.innerValue = val;

    const newVal = JSON.parse(JSON.stringify(val || null));
    if (newVal) {
      this.formControlFrom.setValue(val?.from);
      this.formControlFromMeasure.setValue(val?.fromMeasure);
      this.formControlTo.setValue(val?.to);
      this.formControlToMeasure.setValue(val?.toMeasure);
    }
  }
  filedMapping!: { label: string; value: string }[];

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
      this.formControlFrom.setValue(this.innerValue?.from);
      this.formControlFromMeasure.setValue(this.innerValue?.fromMeasure);
      this.formControlTo.setValue(this.innerValue?.to);
      this.formControlToMeasure.setValue(this.innerValue?.toMeasure);
    } else {
      this.formControlFrom.reset();
      this.formControlFromMeasure.reset();
      this.formControlTo.reset();
      this.formControlToMeasure.reset();
    }
  }
  onSave() {
    if (!this.onValid()) {
      return;
    }
    const data = {
      from: this.formControlFrom.value,
      fromMeasure: this.formControlFromMeasure.value,
      to: this.formControlTo.value,
      toMeasure: this.formControlToMeasure.value
    };

    switch (this.locationType) {
      case 2: {
        data.to = null;
        data.toMeasure = null;
        break;
      }
    }

    this.onChange?.(data);
    this.innerValue = data;
    this.visible = false;
  }

  onValid() {
    this.formControlFromMeasure.markAsDirty();
    this.formControlFrom.markAsDirty();
    this.formControlToMeasure.markAsDirty();
    this.formControlTo.markAsDirty();
    if (!this.formControlFromMeasure.valid || !this.formControlFrom.valid) {
      return false;
    }
    if (this.locationType === 3 && !this.formControlToMeasure.valid) {
      return false;
    }
    if (this.locationType === 4) {
      if (!this.formControlToMeasure.valid || !this.formControlTo.valid) return false;
    }
    return true;
  }
}

@Component({
  selector: 'app-formly-location-configuration',
  template: ` <app-location-configuration
    [formControl]="formControl"
    [formlyAttributes]="field"
    [locationType]="props.locationType || 2"
    [mappingColumns]="props.mappingColumns || []"></app-location-configuration>`,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FormlyFieldLocationConfigurationComponent extends FieldType<
  FieldTypeConfig<
    FormlyFieldProps & {
      locationType: number;
      mappingColumns: DataSourceTableColumn[];
    }
  >
> {}

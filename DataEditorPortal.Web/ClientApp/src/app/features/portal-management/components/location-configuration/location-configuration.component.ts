import {
  CUSTOM_ELEMENTS_SCHEMA,
  ChangeDetectionStrategy,
  Component,
  Input,
  forwardRef
} from '@angular/core';
import { FormControl, NG_VALUE_ACCESSOR, Validators } from '@angular/forms';
import { FieldType, FieldTypeConfig, FormlyFieldProps } from '@ngx-formly/core';

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

  formControlFromVs: FormControl = new FormControl(null, Validators.required);
  formControlFromMeasure: FormControl = new FormControl(
    null,
    Validators.required
  );
  formControlToVs: FormControl = new FormControl(null, Validators.required);
  formControlToMeasure: FormControl = new FormControl(
    null,
    Validators.required
  );

  visible = false;
  @Input()
  set value(val: any) {
    if (JSON.parse(JSON.stringify(val || null))) {
      this.formControlFromVs.setValue(val?.fromVs);
      this.formControlFromMeasure.setValue(val?.fromMeasure);
      this.formControlToVs.setValue(val?.toVs);
      this.formControlToMeasure.setValue(val?.toMeasure);
    }
  }
  @Input() locationType!: number;
  @Input() foreignKeyOptions!: { label: string; value: string }[];
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
      this.formControlFromVs.setValue(this.innerValue?.fromVs);
      this.formControlFromMeasure.setValue(this.innerValue?.fromMeasure);
      this.formControlToVs.setValue(this.innerValue?.toVs);
      this.formControlToMeasure.setValue(this.innerValue?.toMeasure);
    } else {
      this.formControlFromVs.reset();
      this.formControlFromMeasure.reset();
      this.formControlToVs.reset();
      this.formControlToMeasure.reset();
    }
  }
  onSave() {
    if (
      !this.formControlFromMeasure.valid ||
      !this.formControlFromVs.valid ||
      !this.formControlToMeasure.valid ||
      !this.formControlToVs
    ) {
      this.formControlFromMeasure.markAsDirty();
      this.formControlFromVs.markAsDirty();
      this.formControlToMeasure.markAsDirty();
      this.formControlToVs.markAsDirty();
      return;
    }

    const data = {
      fromVs: this.formControlFromVs.value,
      fromMeasure: this.formControlFromMeasure.value,
      toVs: this.formControlToVs.value,
      toMeasure: this.formControlToMeasure.value
    };

    this.onChange?.(data);
    this.innerValue = data;
    this.visible = false;
  }
}

@Component({
  selector: 'app-formly-location-configuration',
  template: ` <app-location-configuration
    [formControl]="formControl"
    [formlyAttributes]="field"
    [locationType]="props.locationType || 2"
    [foreignKeyOptions]="
      props.foreignKeyOptions || []
    "></app-location-configuration>`,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FormlyFieldLocationConfigurationComponent extends FieldType<
  FieldTypeConfig<
    FormlyFieldProps & {
      locationType: number;
      foreignKeyOptions: { label: string; value: string }[];
    }
  >
> {}

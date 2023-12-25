import { CUSTOM_ELEMENTS_SCHEMA, ChangeDetectionStrategy, Component, Input, forwardRef } from '@angular/core';
import { FormControl, NG_VALUE_ACCESSOR, Validators } from '@angular/forms';
import { FieldType, FieldTypeConfig, FormlyFieldProps } from '@ngx-formly/core';
import { DataSourceTableColumn } from '../../models/portal-item';

@Component({
  selector: 'app-gps-locator-fields-config',
  templateUrl: './gps-locator-fields-config.component.html',
  styleUrls: ['./gps-locator-fields-config.component.scss'],
  providers: [
    {
      provide: CUSTOM_ELEMENTS_SCHEMA,
      useExisting: GpsLocatorFieldsConfigComponent,
      multi: true
    },
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => GpsLocatorFieldsConfigComponent),
      multi: true
    }
  ]
})
export class GpsLocatorFieldsConfigComponent {
  @Input()
  set value(val: any) {
    if (!val) {
      this.innerValue = null;
      return;
    }
    this.innerValue = val;

    const newVal = JSON.parse(JSON.stringify(val || null));
    if (newVal) {
      this.formControlBeginX.setValue(val?.beginX);
      this.formControlBeginY.setValue(val?.beginY);
      this.formControlEndX.setValue(val?.endX);
      this.formControlEndY.setValue(val?.endY);
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

  formControlBeginX: FormControl = new FormControl(null, Validators.required);
  formControlBeginY: FormControl = new FormControl(null, Validators.required);
  formControlEndX: FormControl = new FormControl(null, Validators.required);
  formControlEndY: FormControl = new FormControl(null, Validators.required);

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
      beginX: this.formControlBeginX.value,
      beginY: this.formControlBeginY.value,
      endX: this.formControlEndX.value,
      endY: this.formControlEndY.value
    };

    this.onChange?.(data);
    this.innerValue = data;
    this.visible = false;
  }

  onValid() {
    this.formControlBeginX.markAsDirty();
    this.formControlBeginY.markAsDirty();
    this.formControlEndX.markAsDirty();
    this.formControlEndY.markAsDirty();
    if (!this.formControlBeginX.valid || !this.formControlBeginY.valid) return false;
    if (!this.formControlEndX.valid || !this.formControlEndY.valid) return false;

    return true;
  }
}

@Component({
  selector: 'app-formly-gps-locator-fields-config',
  template: ` <app-gps-locator-fields-config
    [formControl]="formControl"
    [formlyAttributes]="field"
    [mappingColumns]="props.mappingColumns || []"></app-gps-locator-fields-config>`,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FormlyFieldGPSLocatorFieldsConfigComponent extends FieldType<
  FieldTypeConfig<
    FormlyFieldProps & {
      mappingColumns: DataSourceTableColumn[];
    }
  >
> {}
FormlyFieldGPSLocatorFieldsConfigComponent;

import { CUSTOM_ELEMENTS_SCHEMA, ChangeDetectionStrategy, Component, Input, forwardRef } from '@angular/core';
import { AbstractControl, ControlValueAccessor, FormGroup, NG_VALUE_ACCESSOR } from '@angular/forms';
import { FieldType, FieldTypeConfig, FormlyFieldConfig, FormlyFieldProps, FormlyFormOptions } from '@ngx-formly/core';

@Component({
  selector: 'app-gps-locator',
  templateUrl: './gps-locator.component.html',
  styleUrls: ['./gps-locator.component.scss'],
  providers: [
    {
      provide: CUSTOM_ELEMENTS_SCHEMA,
      useExisting: GpsLocatorComponent,
      multi: true
    },
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => GpsLocatorComponent),
      multi: true
    }
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GpsLocatorComponent implements ControlValueAccessor {
  @Input()
  set dirty(val: boolean) {
    if (val) this.fields.forEach(x => x.formControl?.markAsDirty());
    else this.fields.forEach(x => x.formControl?.markAsPristine());
  }

  @Input() label!: string;

  _value: any;
  @Input()
  set value(val: any) {
    this._value = val;
  }
  @Input() formControl!: AbstractControl;

  form = new FormGroup({});
  options: FormlyFormOptions = {};

  onChange?: any;
  onTouch?: any;
  disabled = false;
  model: any = {};

  fields: FormlyFieldConfig[] = [
    {
      key: 'beginGpsLat',
      type: 'inputNumber',
      className: 'left-columns',
      props: {
        label: 'Begin GPS'
      }
    },
    {
      key: 'beginGpsLong',
      className: 'right-columns',
      type: 'inputNumber'
    },
    {
      key: 'endGpsLat',
      type: 'inputNumber',
      className: 'left-columns',
      props: {
        label: 'End GPS'
      }
    },
    {
      key: 'endGpsLong',
      type: 'inputNumber',
      className: 'right-columns'
    }
  ];

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

  onLookupLines() {
    console.log('onLookupLines');
  }

  onShowLines() {
    console.log('onShowLines');
  }
}

@Component({
  selector: 'app-formly-gps-locator',
  template: ` <app-gps-locator></app-gps-locator> `,
  styles: [
    `
      :host {
        width: 100% !important;
      }
    `
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FormlyFieldGpsLocatorComponent extends FieldType<FieldTypeConfig<FormlyFieldProps>> {}

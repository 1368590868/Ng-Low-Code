import {
  CUSTOM_ELEMENTS_SCHEMA,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  forwardRef,
  OnInit
} from '@angular/core';
import {
  AbstractControl,
  ControlValueAccessor,
  FormGroup,
  NG_VALUE_ACCESSOR,
  ValidationErrors
} from '@angular/forms';
import {
  FieldType,
  FieldTypeConfig,
  FormlyFieldConfig,
  FormlyFieldProps,
  FormlyFormOptions
} from '@ngx-formly/core';
import { LocationEditorService } from './service/location-editor.service';

@Component({
  selector: 'app-location-editor',
  templateUrl: './location-editor.component.html',
  styleUrls: ['./location-editor.component.scss'],
  providers: [
    {
      provide: CUSTOM_ELEMENTS_SCHEMA,
      useExisting: LocationEditorComponent,
      multi: true
    },
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => LocationEditorComponent),
      multi: true
    }
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LocationEditorComponent implements ControlValueAccessor {
  @Input()
  set dirty(val: boolean) {
    if (val) this.fields.forEach(x => x.formControl?.markAsDirty());
    else this.fields.forEach(x => x.formControl?.markAsPristine());
  }

  _value: any;
  @Input()
  set value(val: any) {
    if (val && val !== 'error') {
      this.model = { ...this.model, ...val };
      this.changeDetectorRef.markForCheck();
    }
    this._value = val;
  }
  @Input() label!: string;
  @Input() locationType!: number;
  @Input() system!: { label: string; value: string }[] | { id: string };
  @Input() mappingColumns!: any;
  @Input() formControl!: AbstractControl;
  _required = false;
  @Input() 
  get required() {
    return this._required;
  }
  set required(val: boolean) {
    console.log(val)
    this._required = val;
    this.fields.forEach(x => {
      if(x.props)  x.props.required = val
    })
  }

  form = new FormGroup({});
  options: FormlyFormOptions = {
  };
  

  onChange?: any;
  onTouch?: any;
  disabled = false;
  model: any = {};
  locationOptions: {
    label: string;
    value: string;
    value1: number;
    value2: number;
  }[] = [];
  fields: FormlyFieldConfig[] = [
    {
      key: 'fromVs',
      type: 'select',
      props: {
        label: 'From VS',
        placeholder: 'Please select',
        required: this.required,
        appendTo: 'body',
        change: (field, event) => {
          const record = this.locationOptions.find(
            x => x.value === event.value
          );
          if (field && field.parent && field.parent.get) {
            const fromMeasureProps = field.parent.get('fromMeasure').props;
            if (fromMeasureProps) {
              fromMeasureProps[
                'helperText'
              ] = `Valid Range:${record?.value1} to ${record?.value2}`;
              fromMeasureProps['min'] = record?.value1;
              fromMeasureProps['max'] = record?.value2;
            }

            // location Type 3 , show toMeasure helper text
            if (this.locationType === 3) {
              const toMeasureProps = field.parent.get('toMeasure').props;
              if (toMeasureProps) {
                toMeasureProps[
                  'helperText'
                ] = `Valid Range:${record?.value1} to ${record?.value2}`;
                toMeasureProps['min'] = record?.value1;
                toMeasureProps['max'] = record?.value2;
              }
            }

            const toVs = field.parent.get('toVs').formControl;
            if (toVs?.value) {
              const fIndex = this.locationOptions.findIndex(
                x => x.value === event.value
              );
              const tIndex = this.locationOptions.findIndex(
                x => x.value === toVs.value
              );
              // current index must be less than ToVs index
              if (tIndex <= fIndex) {
                toVs.setValue(toVs.value);
              }
            }
          }
        }
      },
      hooks: {
        onInit: (field: FormlyFieldConfig & any) => {
          if (!Array.isArray(this.system)) {
            this.locationEditorService
              .getPipeOptions(this.system?.id)
              .subscribe(res => {
                this.locationOptions = res;
                field.props.options = res;
                this.options?.detectChanges?.(field);

                field.parent.get('toVs').props.options = res;
                this.options?.detectChanges?.(field.parent.get('toVs'));
              });
          }

          if (this.locationType === 2) {
            field.props.label = 'VS';
            field.parent.get('fromMeasure').props.label = 'Measure';
          }
        }
      }
    },
    {
      key: 'fromMeasure',
      type: 'inputNumber',
      props: {
        label: 'From Measure',
        placeholder: 'Please enter',
        required: this.required
      },
      hooks: {
        onInit: (field: FormlyFieldConfig & any) => {
          field.formControl.valueChanges.subscribe(() => {
            if (field && field.parent && field.parent.get) {
              const toMeasure = field.parent.get('toMeasure').formControl;
              if (toMeasure?.value) {
                toMeasure?.setValue(toMeasure.value);
              }
            }
          });
        }
      },
      validators: {
        validRange: {
          expression: (control: AbstractControl, field: any) => {
            const { min, max } = field.props;
            if (control.value < min || control.value > max) {
              return false;
            }
            return true;
          },
          message: (
            error: any,
            field: { props: { min: number; max: number } }
          ) => {
            return `Valid Range: ${field.props.min} to ${field.props.max}`;
          }
        }
      }
    },
    {
      key: 'toVs',
      type: 'select',
      props: {
        label: 'To VS',
        placeholder: 'Please select',
        required: this.required,
        appendTo: 'body',
        options: [],
        change: (field, event) => {
          const record = this.locationOptions.find(
            x => x.value === event.value
          );
          if (field && field.parent && field.parent.get) {
            const toMeasureProps = field.parent.get('toMeasure').props;
            if (toMeasureProps) {
              toMeasureProps[
                'helperText'
              ] = `Valid Range:${record?.value1} to ${record?.value2}`;
              toMeasureProps['min'] = record?.value1;
              toMeasureProps['max'] = record?.value2;
            }
          }
        }
      },
      validators: {
        validRange: {
          expression: (control: AbstractControl, field: any) => {
            const fromVsValue = field.parent.get('fromVs').formControl?.value;
            if (fromVsValue) {
              const fIndex = this.locationOptions.findIndex(
                x => x.value === fromVsValue
              );
              const tIndex = this.locationOptions.findIndex(
                x => x.value === control.value
              );
              // current index must be greater than FromSV
              if (tIndex < fIndex) {
                return false;
              }
            }
            return true;
          },
          message: () => {
            return `Valid Select`;
          }
        }
      },
      expressions: {
        hide: () => this.locationType === 3 || this.locationType === 2
      }
    },
    {
      key: 'toMeasure',
      type: 'inputNumber',
      props: {
        required: this.required,
        label: 'To Measure',
        placeholder: 'Please enter'
      },
      validators: {
        validRange: {
          expression: (control: AbstractControl, field: any, msg: any) => {
            const { min, max } = field.props;
            if (control.value < min || control.value > max) {
              return false;
            }
            return true;
          },
          message: (
            error: any,
            field: { props: { min: number; max: number } }
          ) => {
            return `Valid Range: ${field.props.min} to ${field.props.max}`;
          }
        },
        validLocationTypeEq3: {
          expression: (control: AbstractControl, field: any) => {
            const fromMeasure =
              field.parent.get('fromMeasure').formControl.value;
            if (control.value <= fromMeasure) {
              return false;
            }
            return true;
          },
          message: `To Measure should be greater than From Measure`
        }
      },
      expressions: {
        hide: () => this.locationType === 2
      }
    }
  ];

  constructor(
    private locationEditorService: LocationEditorService,
    private changeDetectorRef: ChangeDetectorRef
  ) {}

  modelChange($event: any) {
    let val: any;
    if (this.form.valid) {
      if (this.locationType === 3) {
        val = { ...$event, toVs: $event.fromVs };
      } else {
        val = { ...$event };
      }
    } else {
      val = 'error';
    }
    if (this._value !== val) {
      this._value = val;
      this.onChange?.(val);
    }
  }

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
}

@Component({
  selector: 'app-formly-location-editor',
  template: `<app-location-editor
    [formControl]="formControl"
    [formlyAttributes]="field"
    [dirty]="formControl.dirty"
    [required]="props.required || false"
    [label]="props.label || 'Location'"
    [locationType]="props.locationType || 2"
    [mappingColumns]="props.mappingColumns || []"
    [system]="props.system || []"></app-location-editor>`,
  styles: [
    `
      :host {
        width: 100% !important;
      }
    `
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FormlyFieldLocationEditorComponent
  extends FieldType<
    FieldTypeConfig<
      FormlyFieldProps & {
        dirty: boolean;
        label: string;
        locationType: number;
        system: { label: string; value: string }[];
        mappingColumns: { label: string; value: string }[];
      }
    >
  >
  implements OnInit
{
  ngOnInit(): void {
    this.field.validation = {
      messages: { required: ' ', errorData: ' ' }
    };
    this.field.formControl.addValidators(
      (control: AbstractControl): ValidationErrors | null => {
        if (control.value === 'error') {
          control.markAsPristine();
          return { errorData: true };
        }
        return null;
      }
    );
  }
}

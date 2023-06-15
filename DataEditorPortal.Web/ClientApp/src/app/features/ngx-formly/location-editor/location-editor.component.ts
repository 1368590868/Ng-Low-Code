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
    this._required = val;
    this.fields.forEach(x => {
      if (x.props) x.props.required = val;
    });
  }

  _lengthLabel = '';
  @Input()
  get lengthLabel() {
    return this._lengthLabel;
  }
  set lengthLabel(val: string) {
    this._lengthLabel = val;
    this.fields.forEach(x => {
      if (x.props && x.key === 'lengthFeet') x.props.label = val;

      if (x.props && x.key === 'toMeasure' && !val && this.locationType !== 2)
        x.className = 'no-length';

      if (x.props && x.key === 'fromMeasure' && !val && this.locationType === 2)
        x.className = 'no-length';
    });
  }

  _fromLabel = '';
  @Input()
  get fromLabel() {
    return this._fromLabel;
  }
  set fromLabel(val: string) {
    this._fromLabel = val;
    this.fields.forEach(x => {
      if (x.props && x.key === 'from') x.props.label = val;
    });
  }

  _fromMeasureLabel = 'From Measure';
  @Input()
  get fromMeasureLabel() {
    return this._fromMeasureLabel;
  }
  set fromMeasureLabel(val: string) {
    this._fromMeasureLabel = val;
    this.fields.forEach(x => {
      if (x.props && x.key === 'fromMeasure') x.props.label = val;
    });
  }

  _toMeasureLabel = 'To Measure';
  @Input()
  get toMeasureLabel() {
    return this._toMeasureLabel;
  }
  set toMeasureLabel(val: string) {
    this._toMeasureLabel = val;
    this.fields.forEach(x => {
      if (x.props && x.key === 'toMeasure') x.props.label = val;
    });
  }

  _toLabel = 'To';
  @Input()
  get toLabel() {
    return this._toLabel;
  }
  set toLabel(val: string) {
    this._toLabel = val;
    this.fields.forEach(x => {
      if (x.props && x.key === 'to') x.props.label = val;
    });
  }

  form = new FormGroup({});
  options: FormlyFormOptions = {};

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
      key: 'from',
      type: 'select',
      props: {
        label: this.fromLabel,
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
              ] = `Min: ${record?.value1} Max: ${record?.value2}`;
              fromMeasureProps['min'] = record?.value1;
              fromMeasureProps['max'] = record?.value2;
            }

            // location Type 3 , show toMeasure helper text
            if (this.locationType === 3) {
              const toMeasureProps = field.parent.get('toMeasure').props;
              if (toMeasureProps) {
                toMeasureProps[
                  'helperText'
                ] = `Min: ${record?.value1} Max: ${record?.value2}`;
                toMeasureProps['min'] = record?.value1;
                toMeasureProps['max'] = record?.value2;
              }
            }

            const to = field.parent.get('to').formControl;
            if (to?.value) {
              const fIndex = this.locationOptions.findIndex(
                x => x.value === event.value
              );
              const tIndex = this.locationOptions.findIndex(
                x => x.value === to.value
              );
              // current index must be less than ToVs index
              if (tIndex <= fIndex) {
                to.setValue(to.value);
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

                field.parent.get('to').props.options = res;
                this.options?.detectChanges?.(field.parent.get('to'));

                // Init fromMeasure and toMeasure helper text
                if (field && field.parent && field.parent.get) {
                  const fromMeasureProps =
                    field.parent.get('fromMeasure').props;
                  const toMeasureProps = field.parent.get('toMeasure').props;

                  // from to have value , set helper text
                  const from = field.parent.get('from').formControl;
                  const to = field.parent.get('to').formControl;

                  const fromRecord = res.find(x => x.value === from.value);
                  const toRecord = res.find(x => x.value === to.value);

                  if (fromMeasureProps && toMeasureProps) {
                    fromMeasureProps['helperText'] = `Min: ${
                      fromRecord?.value1 ?? '--'
                    }  Max: ${fromRecord?.value2 ?? '--'}`;

                    toMeasureProps['helperText'] = `Min: ${
                      toRecord?.value1 ?? '--'
                    }  Max: ${toRecord?.value2 ?? '--'}`;
                  }
                }
              });
          }
        }
      }
    },
    {
      key: 'fromMeasure',
      type: 'inputNumber',
      className: '',
      props: {
        label: this.fromMeasureLabel,
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
      key: 'to',
      type: 'select',
      props: {
        label: this.toLabel,
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
              ] = `Min: ${record?.value1} Max: ${record?.value2}`;
              toMeasureProps['min'] = record?.value1;
              toMeasureProps['max'] = record?.value2;
            }
          }
        }
      },
      validators: {
        validRange: {
          expression: (control: AbstractControl, field: any) => {
            const fromValue = field.parent.get('from').formControl?.value;
            if (fromValue) {
              const fIndex = this.locationOptions.findIndex(
                x => x.value === fromValue
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
      className: '',
      props: {
        required: this.required,
        label: this.toMeasureLabel,
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
    },
    {
      key: 'lengthFeet',
      type: 'inputNumber',
      props: {
        label: this.lengthLabel,
        disabled: true,
        hideRequiredMarker: true
      },
      expressions: {
        hide: () => !this.lengthLabel,
        calcLength: field => {
          if (this.model?.fromMeasure >= 0 && this.model?.toMeasure >= 0) {
            if (field && field.formControl)
              field.formControl.setValue(
                this.model.toMeasure - this.model.fromMeasure
              );
          }
        }
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
        val = { ...$event, to: $event.from };
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
    [label]="props.label || ''"
    [locationType]="props.locationType || 2"
    [mappingColumns]="props.mappingColumns || []"
    [system]="props.system || []"
    [fromLabel]="props.fromLabel"
    [toLabel]="props.toLabel"
    [fromMeasureLabel]="props.fromMeasureLabel"
    [toMeasureLabel]="props.toMeasureLabel"
    [lengthLabel]="props.lengthLabel || ''"></app-location-editor>`,
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
        fromLabel: string;
        toLabel: string;
        fromMeasureLabel: string;
        toMeasureLabel: string;
        lengthLabel?: string;
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

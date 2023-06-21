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
  @Input() system!: { id: string };
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

  _fromDescription = '';
  @Input()
  get fromDescription() {
    return this._fromDescription;
  }
  set fromDescription(val: string) {
    this._fromDescription = val;
    this.fields.forEach(x => {
      if (x.props && x.key === 'from') x.props.description = val;
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

  _fromMeasureDescription = '';
  @Input()
  get fromMeasureDescription() {
    return this._fromMeasureDescription;
  }
  set fromMeasureDescription(val: string) {
    this._fromDescription = val;
    this.fields.forEach(x => {
      if (x.props && x.key === 'fromMeasure') x.props.description = val;
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

  _toMeasureDescription = '';
  @Input()
  get toMeasureDescription() {
    return this._toMeasureDescription;
  }
  set toMeasureDescription(val: string) {
    this._toMeasureDescription = val;
    this.fields.forEach(x => {
      if (x.props && x.key === 'toMeasure') x.props.description = val;
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

  _toDescription = '';
  @Input()
  get toDescription() {
    return this._toDescription;
  }
  set toDescription(val: string) {
    this._toDescription = val;
    this.fields.forEach(x => {
      if (x.props && x.key === 'to') x.props.description = val;
    });
  }

  _systemName!: string;
  @Input()
  get systemName() {
    return this._systemName;
  }
  set systemName(val: string) {
    this._systemName = val;
    this.systemNameChange = true;
    this.form.reset();
    this.fields.forEach(x => {
      // min max reset
      if (x && x.parent && x.parent.get) {
        const fromMeasureProps = x.parent.get('fromMeasure').props;
        const toMeasureProps = x.parent.get('toMeasure').props;
        if (fromMeasureProps && toMeasureProps) {
          fromMeasureProps['helperText'] = `Min: --    Max: --`;
          toMeasureProps['helperText'] = `Min: --    Max: --`;
        }

        const fromProps = x.parent.get('from').props;
        const toProps = x.parent.get('to').props;
        if (!val) {
          if (fromProps) fromProps['options'] = [];
          if (toProps) toProps['options'] = [];
        }
      }
    });
    this.dirty = false;
  }

  form = new FormGroup({});
  options: FormlyFormOptions = {};
  systemNameChange = false;

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
        options: [],
        onShow: () => this.onShow(),
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
          // Init fromMeasure and toMeasure helper text
          if (field && field.parent && field.parent.get) {
            const fromMeasureProps = field.parent.get('fromMeasure').props;
            const toMeasureProps = field.parent.get('toMeasure').props;
            if (fromMeasureProps && toMeasureProps) {
              fromMeasureProps['helperText'] = `Min: --  Max: --`;

              toMeasureProps['helperText'] = `Min: --  Max: --`;

              this.options.detectChanges?.(field);
            }
            if (this._systemName) {
              this.onShow();
            }
          }
        }
      }
    },
    {
      key: 'fromMeasure',
      type: 'inputNumber',
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
        onShow: () => this.onShow(),
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

  onShow() {
    const allModel = this.formControl.parent;
    const fromProps = this.fields[0].props;
    const toProps = this.fields[2].props;
    if (this._systemName && this.systemNameChange) {
      this.locationEditorService
        .getPipeOptions(this.system.id, allModel?.value)
        .subscribe(res => {
          this.locationOptions = res;
          // Init fromMeasure and toMeasure helper text

          const fromMeasureProps = this.fields[1].props;
          const toMeasureProps = this.fields[3].props;

          // from to have value , set helper text
          const from = this.fields[0].formControl;
          const to = this.fields[2].formControl;

          if (from && to) {
            const fromRecord = res.find(x => x.value === from.value);
            const toRecord = res.find(x => x.value === to.value);

            if (fromMeasureProps && toMeasureProps) {
              fromMeasureProps['helperText'] = `Min: ${
                fromRecord?.value1 ?? '--'
              }  Max: ${fromRecord?.value2 ?? '--'}`;

              toMeasureProps['helperText'] = `Min: ${
                toRecord?.value1 ?? '--'
              }  Max: ${toRecord?.value2 ?? '--'}`;

              this.options.detectChanges?.(this.fields[1]);
            }
          }

          if (fromProps && toProps) {
            fromProps.options = res;
            toProps.options = res;
          }
          this.systemNameChange = false;
        });
    }
  }

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
    [system]="props.system || { id: '' }"
    [fromLabel]="props.fromLabel"
    [fromDescription]="props.fromDescription || ''"
    [toLabel]="props.toLabel"
    [toDescription]="props.toDescription || ''"
    [fromMeasureLabel]="props.fromMeasureLabel"
    [fromMeasureDescription]="props.fromMeasureDescription || ''"
    [toMeasureLabel]="props.toMeasureLabel"
    [toMeasureDescription]="props.toMeasureDescription || ''"
    [lengthLabel]="props.lengthLabel || ''"
    [systemName]="props.systemName || ''"></app-location-editor>`,
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
        system: { id: string };
        mappingColumns: { label: string; value: string }[];
        fromLabel: string;
        fromDescription?: string;
        toLabel: string;
        toDescription?: string;
        fromMeasureLabel: string;
        fromMeasureDescription?: string;
        toMeasureLabel: string;
        toMeasureDescription?: string;
        lengthLabel?: string;
        systemName?: string;
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

import {
  CUSTOM_ELEMENTS_SCHEMA,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  forwardRef
} from '@angular/core';
import {
  AbstractControl,
  ControlValueAccessor,
  FormGroup,
  NG_VALUE_ACCESSOR
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
  set value(val: any) {
    if (val) {
      setTimeout(() => {
        this.model = { ...this.model, ...val };
        this.changeDetectorRef.detectChanges();
      }, 100);
    }
  }
  @Input() label!: string;
  @Input() locationType!: number;
  @Input() system!: { label: string; value: string }[] | { id: string };
  @Input() mappingColumns!: any;
  @Input() formControl!: AbstractControl;

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
      key: 'fromVs',
      type: 'select',
      className: 'mb-2',
      props: {
        label: 'From VS',
        placeholder: 'Please select',
        required: true,
        appendTo: 'body',
        change: (field, event) => {
          const record = this.locationOptions.find(
            x => x.value === event.value
          );
          if (field && field.parent && field.parent.get) {
            const fromMeasure = field.parent.get('fromMeasure');
            fromMeasure.props![
              'helperText'
            ] = `Valid Range:${record?.value1} to ${record?.value2}`;
            fromMeasure.props!['min'] = record?.value1;
            fromMeasure.props!['max'] = record?.value2;

            // location Type 3 , show toMeasure helper text
            if (this.locationType === 3) {
              const toMeasure = field.parent.get('toMeasure');
              toMeasure.props![
                'helperText'
              ] = `Valid Range:${record?.value1} to ${record?.value2}`;
              toMeasure.props!['min'] = record?.value1;
              toMeasure.props!['max'] = record?.value2;
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
                field.parent.get('toVs').props.options = res;
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
        required: true
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
        }
      }
    },
    {
      key: 'toVs',
      type: 'select',
      props: {
        label: 'To VS',
        placeholder: 'Please select',
        required: true,
        appendTo: 'body',
        options: [],
        change: (field, event) => {
          const record = this.locationOptions.find(
            x => x.value === event.value
          );
          if (field && field.parent && field.parent.get) {
            const toMeasure = field.parent.get('toMeasure');
            toMeasure.props![
              'helperText'
            ] = `Valid Range:${record?.value1} to ${record?.value2}`;
            toMeasure.props!['min'] = record?.value1;
            toMeasure.props!['max'] = record?.value2;
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
      hideExpression: () => this.locationType === 3 || this.locationType === 2
    },
    {
      key: 'toMeasure',
      type: 'inputNumber',
      props: {
        required: true,
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
      hideExpression: () => this.locationType === 2
    }
  ];

  constructor(
    private locationEditorService: LocationEditorService,
    private changeDetectorRef: ChangeDetectorRef
  ) {}

  modelChange($event: any) {
    if (this.form.valid) {
      if (this.locationType === 3) {
        this.onChange?.({ ...$event, toVs: $event.fromVs });
      } else {
        this.onChange?.($event);
      }
    } else {
      this.onChange?.(null);
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
export class FormlyFieldLocationEditorComponent extends FieldType<
  FieldTypeConfig<
    FormlyFieldProps & {
      label: string;
      locationType: number;
      system: { label: string; value: string }[];
      mappingColumns: { label: string; value: string }[];
    }
  >
> {}

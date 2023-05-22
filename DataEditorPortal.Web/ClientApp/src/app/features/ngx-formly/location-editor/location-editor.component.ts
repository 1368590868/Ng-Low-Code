import {
  CUSTOM_ELEMENTS_SCHEMA,
  ChangeDetectionStrategy,
  Component,
  Input,
  forwardRef
} from '@angular/core';
import { AbstractControl, NG_VALUE_ACCESSOR } from '@angular/forms';
import {
  FieldType,
  FieldTypeConfig,
  FormlyFieldConfig,
  FormlyFieldProps
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
  ]
})
export class LocationEditorComponent {
  @Input()
  set value(val: any) {
    if (val) console.log;
  }
  @Input() label!: string;
  @Input() locationType!: number;
  @Input() system!: { label: string; value: string }[] | { id: string };

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
            fromMeasure.props!['minNum'] = record?.value1;
            fromMeasure.props!['maxNum'] = record?.value2;
            if (this.locationType === 3) {
              const toMeasure = field.parent.get('toMeasure');
              toMeasure.props![
                'helperText'
              ] = `Valid Range:${record?.value1} to ${record?.value2}`;
              toMeasure.props!['minNum'] = record?.value1;
              toMeasure.props!['maxNum'] = record?.value2;
            }

            if (fromMeasure.formControl?.value) {
              fromMeasure.formControl.markAsTouched();
              fromMeasure.formControl.updateValueAndValidity();
            }
          }
        }
      },
      modelOptions: {
        updateOn: 'blur'
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
          } else {
            field.props.options = this.system;
            field.parent.get('toVs').props.options = this.system;
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
        placeholder: 'Please enter'
      },
      validators: {
        validRange: {
          expression: (control: AbstractControl, field: any, msg: any) => {
            const { minNum, maxNum } = field.props;
            if (control.value < minNum || control.value > maxNum) {
              return false;
            }
            return true;
          },
          message: (
            error: any,
            field: { props: { minNum: number; maxNum: number } }
          ) => {
            return `Valid Range: ${field.props.minNum} to ${field.props.maxNum}`;
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
            toMeasure.props!['minNum'] = record?.value1;
            toMeasure.props!['maxNum'] = record?.value2;

            if (toMeasure.formControl?.value) {
              toMeasure.formControl.markAsTouched();
              toMeasure.formControl.updateValueAndValidity();
            }
          }
        }
      },
      hideExpression: () => this.locationType === 3 || this.locationType === 2
    },
    {
      key: 'toMeasure',
      type: 'inputNumber',
      props: {
        label: 'To Measure',
        placeholder: 'Please enter'
      },
      validators: {
        validRange: {
          expression: (control: AbstractControl, field: any, msg: any) => {
            const { minNum, maxNum } = field.props;
            if (control.value < minNum || control.value > maxNum) {
              return false;
            }
            return true;
          },
          message: (
            error: any,
            field: { props: { minNum: number; maxNum: number } }
          ) => {
            return `Valid Range: ${field.props.minNum} to ${field.props.maxNum}`;
          }
        },
        validLocationTypeEq3: {
          expression: (control: AbstractControl, field: any, msg: any) => {
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

  constructor(private locationEditorService: LocationEditorService) {}

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
    }
  >
> {}

import { Component, ChangeDetectionStrategy, Type } from '@angular/core';
import { FieldType, FieldTypeConfig, FormlyFieldConfig } from '@ngx-formly/core';
import { FormlyFieldProps } from '@ngx-formly/primeng/form-field';

interface InputNumberProps extends FormlyFieldProps {
  useGrouping?: boolean;
  showButtons?: boolean;
  prefix?: string;
  min?: number | any;
  max?: number | any;
  mode?: 'decimal' | 'currency' | 'percent';
  maxFractionDigits?: number;
}

export interface FormlySelectFieldConfig extends FormlyFieldConfig<InputNumberProps> {
  type: 'inputNumber' | Type<FormlyFieldInputNumberComponent>;
}

@Component({
  selector: 'app-formly-field-primeng-input-number',
  template: `
    <p-inputNumber
      updateOn="blur"
      [useGrouping]="props.useGrouping ?? false"
      [showButtons]="props.showButtons ?? true"
      [placeholder]="props.placeholder || ''"
      [prefix]="props.prefix || ''"
      [min]="props.min ?? null"
      [max]="props.max ?? null"
      [mode]="props.mode || 'decimal'"
      [maxFractionDigits]="props.maxFractionDigits ?? 2"
      [formControl]="formControl">
    </p-inputNumber>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FormlyFieldInputNumberComponent extends FieldType<FieldTypeConfig<InputNumberProps>> {}

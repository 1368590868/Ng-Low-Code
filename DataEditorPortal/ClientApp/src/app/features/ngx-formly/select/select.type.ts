import { Component, ChangeDetectionStrategy, Type } from '@angular/core';
import {
  FieldType,
  FieldTypeConfig,
  FormlyFieldConfig
} from '@ngx-formly/core';
import { FormlyFieldProps } from '@ngx-formly/primeng/form-field';
import { FormlyFieldSelectProps } from '@ngx-formly/core/select';

interface SelectProps extends FormlyFieldProps, FormlyFieldSelectProps {
  appendTo?: string;
}

export interface FormlySelectFieldConfig
  extends FormlyFieldConfig<SelectProps> {
  type: 'select' | Type<FormlyFieldSelectComponent>;
}

@Component({
  selector: 'app-formly-field-primeng-select',
  template: `
    <p-dropdown
      [placeholder]="props.placeholder || ''"
      [options]="(props.options | formlySelectOptions : field | async) || []"
      [formControl]="formControl"
      [formlyAttributes]="field"
      [showClear]="!props.required"
      (onChange)="props.change && props.change(field, $event)"
      [appendTo]="props.appendTo">
    </p-dropdown>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FormlyFieldSelectComponent extends FieldType<
  FieldTypeConfig<SelectProps>
> {}

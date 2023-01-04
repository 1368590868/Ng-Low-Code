import { Component, ChangeDetectionStrategy, Type } from '@angular/core';
import {
  FieldType,
  FieldTypeConfig,
  FormlyFieldConfig
} from '@ngx-formly/core';
import { FormlyFieldProps } from '@ngx-formly/primeng/form-field';

type MultiSelectProps = FormlyFieldProps;

export interface FormlyMultiSelectFieldConfig
  extends FormlyFieldConfig<MultiSelectProps> {
  type: 'multiSelect' | Type<FormlyFieldMultiSelectComponent>;
}

@Component({
  selector: 'app-formly-field-primeng-multiselect',
  template: `
    <p-multiSelect
      [placeholder]="props.placeholder || ''"
      [options]="(props.options | formlySelectOptions : field | async) || []"
      [formControl]="formControl"
      [formlyAttributes]="field"
      [showClear]="!props.required"
      (onChange)="props.change && props.change(field, $event)"
      [virtualScroll]="true"
      [virtualScrollItemSize]="30"
      [showToggleAll]="false"
      [filter]="true">
    </p-multiSelect>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FormlyFieldMultiSelectComponent extends FieldType<
  FieldTypeConfig<MultiSelectProps>
> {}

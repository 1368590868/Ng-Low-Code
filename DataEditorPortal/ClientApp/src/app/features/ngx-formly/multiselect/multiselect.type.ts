import { Component, ChangeDetectionStrategy, Type } from '@angular/core';
import {
  FieldType,
  FieldTypeConfig,
  FormlyFieldConfig
} from '@ngx-formly/core';
import { FormlyFieldProps } from '@ngx-formly/primeng/form-field';

interface MultiSelectProps extends FormlyFieldProps {
  appendTo?: string;
  virtualScroll: boolean;
  virtualScrollItemSize: number;
}
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
      [virtualScroll]="props.virtualScroll"
      [virtualScrollItemSize]="props.virtualScrollItemSize"
      [showToggleAll]="false"
      [filter]="true"
      [appendTo]="props.appendTo"
      display="chip">
    </p-multiSelect>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FormlyFieldMultiSelectComponent extends FieldType<
  FieldTypeConfig<MultiSelectProps>
> {}

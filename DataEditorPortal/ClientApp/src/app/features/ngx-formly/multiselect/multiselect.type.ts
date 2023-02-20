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
  showHeader?: boolean;
  display?: string;
  filter?: boolean;
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
      [filter]="props.filter === undefined ? true : props.filter"
      [appendTo]="props.appendTo || 'body'"
      [showHeader]="props.showHeader === undefined ? true : props.showHeader"
      [display]="props.display || 'chip'">
    </p-multiSelect>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FormlyFieldMultiSelectComponent extends FieldType<
  FieldTypeConfig<MultiSelectProps>
> {}

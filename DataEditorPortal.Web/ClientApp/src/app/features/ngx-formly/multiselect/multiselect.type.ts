import { AsyncPipe } from '@angular/common';
import { Component, ChangeDetectionStrategy, Type } from '@angular/core';
import {
  FieldType,
  FieldTypeConfig,
  FormlyFieldConfig
} from '@ngx-formly/core';
import { FormlySelectOptionsPipe } from '@ngx-formly/core/select';
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
      [filter]="showFilter(props.options || [])"
      [appendTo]="props.appendTo || 'body'"
      [showHeader]="props.showHeader === undefined ? true : props.showHeader"
      [display]="props.display || 'chip'">
    </p-multiSelect>
  `,
  providers: [FormlySelectOptionsPipe, AsyncPipe],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FormlyFieldMultiSelectComponent extends FieldType<
  FieldTypeConfig<MultiSelectProps>
> {
  constructor(
    private formlySelectOptionsPipe: FormlySelectOptionsPipe,
    private asyncPipe: AsyncPipe
  ) {
    super();
  }
  showFilter(options: any): boolean {
    const newOptions = this.asyncPipe.transform(
      this.formlySelectOptionsPipe.transform(options, this.field)
    );

    return (newOptions || []).length > 5;
  }
}

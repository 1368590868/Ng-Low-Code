import { ChangeDetectionStrategy, Component, Type } from '@angular/core';
import { FieldType, FieldTypeConfig, FormlyFieldConfig } from '@ngx-formly/core';
import { FormlyFieldSelectProps } from '@ngx-formly/core/select';
import { FormlyFieldProps } from '@ngx-formly/primeng/form-field';

interface SelectProps extends FormlyFieldProps, FormlyFieldSelectProps {
  appendTo?: string;
  autoDisplayFirst: boolean;
  virtualScrollItemSize?: number;
  onShow?: () => void;
  emptyMessage: string;
  showClear?: boolean;
}

export interface FormlySelectFieldConfig extends FormlyFieldConfig<SelectProps> {
  type: 'select' | Type<FormlyFieldSelectComponent>;
}

@Component({
  selector: 'app-formly-field-primeng-select',
  template: `
    <p-dropdown
      #dropdown
      [placeholder]="props.placeholder || ''"
      [options]="(props.options | formlySelectOptions : field | async) || []"
      [formControl]="formControl"
      [formlyAttributes]="field"
      [showClear]="props.showClear !== undefined ? props.showClear : !props.required"
      (onChange)="props.change && props.change(field, $event)"
      [appendTo]="props.appendTo || 'body'"
      [autoDisplayFirst]="!!props.autoDisplayFirst"
      (onShow)="props.onShow && props.onShow()"
      [emptyMessage]="props.emptyMessage">
    </p-dropdown>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FormlyFieldSelectComponent extends FieldType<FieldTypeConfig<SelectProps>> {}

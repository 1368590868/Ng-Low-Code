import { Component, ChangeDetectionStrategy, Type } from '@angular/core';
import {
  FieldType,
  FieldTypeConfig,
  FormlyFieldConfig
} from '@ngx-formly/core';
import { FormlyFieldProps } from '@ngx-formly/primeng/form-field';
import { FormlyFieldSelectProps } from '@ngx-formly/core/select';

interface IconSelectProps extends FormlyFieldProps, FormlyFieldSelectProps {
  appendTo?: string;
  virtualScroll?: boolean;
  resetFilterOnHide?: boolean;
  virtualScrollItemSize?: number;
}

export interface FormlySelectFieldConfig
  extends FormlyFieldConfig<IconSelectProps> {
  type: 'select' | Type<FormlyFieldIconSelectComponent>;
}

@Component({
  selector: 'app-formly-field-primeng-icon-select',
  template: `
    <app-icon-select
      [formControl]="formControl"
      [formlyAttributes]="field"></app-icon-select>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FormlyFieldIconSelectComponent extends FieldType<
  FieldTypeConfig<IconSelectProps>
> {}

import { Component, ChangeDetectionStrategy, Type } from '@angular/core';
import {
  FieldType,
  FieldTypeConfig,
  FormlyFieldConfig
} from '@ngx-formly/core';
import { FormlyFieldProps } from '@ngx-formly/primeng/form-field';

interface CheckboxProps extends FormlyFieldProps {
  label: string;
  binary?: boolean;
}

export interface FormlyCheckBoxFieldConfig
  extends FormlyFieldConfig<CheckboxProps> {
  type: 'checkbox' | Type<FormlyFieldCheckBoxComponent>;
}

@Component({
  selector: 'app-formly-field-primeng-checkbox',
  template: `
    <div
      class="p-field-radiobutton"
      *ngFor="
        let option of props.options | formlySelectOptions : field | async
      ">
      <p-checkbox
        [binary]="props.binary || false"
        [name]="field.name || id"
        [inputId]="option.value"
        [label]="option.label"
        [value]="option.value"
        [formControl]="formControl"
        [formlyAttributes]="field"
        (onChange)="props.change && props.change(field, $event)">
      </p-checkbox>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FormlyFieldCheckBoxComponent extends FieldType<
  FieldTypeConfig<CheckboxProps>
> {}

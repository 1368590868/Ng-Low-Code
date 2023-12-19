import { Component, ChangeDetectionStrategy, Type } from '@angular/core';
import { FieldType, FieldTypeConfig, FormlyFieldConfig } from '@ngx-formly/core';
import { FormlyFieldProps } from '@ngx-formly/primeng/form-field';

interface InputMaskProps extends FormlyFieldProps {
  appendTo?: string;
  mask: string;
  styleClass: string;
}

export interface FormlySelectFieldConfig extends FormlyFieldConfig<InputMaskProps> {
  type: 'inputMask' | Type<FormlyFieldInputMaskComponent>;
}

@Component({
  selector: 'app-formly-field-primeng-input-mask',
  template: `
    <p-inputMask [mask]="props.mask" [placeholder]="props.placeholder || ''" [formControl]="formControl"> </p-inputMask>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FormlyFieldInputMaskComponent extends FieldType<FieldTypeConfig<InputMaskProps>> {}

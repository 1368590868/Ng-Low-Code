import { Component, ChangeDetectionStrategy } from '@angular/core';
import { FieldType, FieldTypeConfig } from '@ngx-formly/core';
import { FormlyFieldProps } from '@ngx-formly/primeng/form-field';

interface TriStateCheckboxProps extends FormlyFieldProps {
  label: string;
}

@Component({
  selector: 'app-formly-field-primeng-tristatecheckbox',
  template: `
    <p-triStateCheckbox
      [name]="field.name || id"
      [label]="props.label"
      [formControl]="formControl"
      [formlyAttributes]="field"
      (onChange)="props.change && props.change(field, $event)">
    </p-triStateCheckbox>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FormlyFieldTriStateCheckBoxComponent extends FieldType<FieldTypeConfig<TriStateCheckboxProps>> {}

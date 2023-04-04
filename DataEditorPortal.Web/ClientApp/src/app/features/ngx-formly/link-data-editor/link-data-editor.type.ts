import { Component, ChangeDetectionStrategy, Type } from '@angular/core';
import { FieldType, FieldTypeConfig } from '@ngx-formly/core';
import { FormlyFieldProps } from '@ngx-formly/primeng/form-field';

interface LinkDataEditorProps extends FormlyFieldProps {
  tableName?: string;
  searchParams?: any;
  direction: 'left' | 'right';
}

@Component({
  selector: 'app-formly-field-link-data-editor',
  template: ` <p-inputNumber> </p-inputNumber> `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FormlyFieldLinkDataEditorComponent extends FieldType<
  FieldTypeConfig<LinkDataEditorProps>
> {}

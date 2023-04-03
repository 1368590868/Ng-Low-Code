import { Component, ChangeDetectionStrategy, Type } from '@angular/core';
import { FieldType, FieldTypeConfig } from '@ngx-formly/core';
import { FormlyFieldProps } from '@ngx-formly/primeng/form-field';

interface LinkedTableDataEditorProps extends FormlyFieldProps {
  tableName?: string;
  searchParams?: any;
  direction: 'left' | 'right';
}

@Component({
  selector: 'app-formly-field-linked-table-data',
  template: ` <p-inputNumber> </p-inputNumber> `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FormlyFieldLinkedTableDataEditorComponent extends FieldType<
  FieldTypeConfig<LinkedTableDataEditorProps>
> {}

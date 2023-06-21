import { Component, ChangeDetectionStrategy } from '@angular/core';
import { FieldType, FieldTypeConfig } from '@ngx-formly/core';
import { FormlyFieldProps } from '@ngx-formly/primeng/form-field';

interface MonacoEditorProps extends FormlyFieldProps {
  config?: any;
  onInit?: any;
  libSource: string;
}

@Component({
  selector: 'app-formly-field-monaco-editor',
  template: `
    <ngx-monaco-editor
      [formControl]="formControl"
      (onInit)="props.onInit && props.onInit($event)"
      class="pt-3 border-round monaco-editor-wrapper overflow-hidden mb-2"
      [options]="props.config || {}"
      [placeholder]="props.placeholder"
      [libSource]="props.libSource"></ngx-monaco-editor>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FormlyFieldMonacoEditorComponent extends FieldType<
  FieldTypeConfig<MonacoEditorProps>
> {}

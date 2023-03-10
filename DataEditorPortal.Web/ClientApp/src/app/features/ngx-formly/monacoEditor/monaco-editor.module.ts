import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { FormlyModule } from '@ngx-formly/core';
import { MonacoEditorModule } from 'ngx-monaco-editor';

import { FormlyFormFieldModule } from '@ngx-formly/primeng/form-field';
import { FormlyFieldMonacoEditorComponent } from './monaco-editor.type';

@NgModule({
  declarations: [FormlyFieldMonacoEditorComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MonacoEditorModule,
    FormlyFormFieldModule,
    FormlyModule.forChild({
      types: [
        {
          name: 'monacoEditor',
          component: FormlyFieldMonacoEditorComponent,
          wrappers: ['form-field']
        }
      ]
    })
  ]
})
export class FormlyMonacoEditorModule {}
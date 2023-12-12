import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { FormlyModule } from '@ngx-formly/core';
import { MonacoEditorModule } from 'ngx-monaco-editor-v2';
import { SharedModule } from 'src/app/shared';
import { FormlyFieldMonacoEditorComponent } from './monaco-editor.type';

@NgModule({
  declarations: [FormlyFieldMonacoEditorComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    SharedModule,
    MonacoEditorModule,
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

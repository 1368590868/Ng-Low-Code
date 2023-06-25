import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { FormlyModule } from '@ngx-formly/core';
import { MonacoEditorModule } from 'ngx-monaco-editor';
import { FormlyFieldMonacoEditorComponent } from './monaco-editor.type';
import { SharedModule } from 'src/app/shared';

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

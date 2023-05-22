import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { FormlyModule } from '@ngx-formly/core';
import { LocationEditorComponent } from './location-editor.component';
import { InputTextModule } from 'primeng/inputtext';
import { FormsModule } from '@angular/forms';
import { FormlyFieldLocationEditorComponent } from './location-editor.component';
import { InputNumberModule } from 'primeng/inputnumber';
@NgModule({
  declarations: [LocationEditorComponent, FormlyFieldLocationEditorComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InputTextModule,
    FormsModule,
    InputNumberModule,
    FormlyModule.forChild({
      types: [
        {
          name: 'locationEditor',
          component: FormlyFieldLocationEditorComponent,
          wrappers: ['form-field']
        }
      ]
    })
  ]
})
export class FormlyLocationEditorModule {}

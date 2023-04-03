import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { FormlyModule } from '@ngx-formly/core';
import { InputNumberModule } from 'primeng/inputnumber';
import { FormlyFieldLinkedTableDataEditorComponent } from './linked-table.type';

@NgModule({
  declarations: [FormlyFieldLinkedTableDataEditorComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InputNumberModule,
    FormlyModule.forChild({
      types: [
        {
          name: 'linkedTableDataEditor',
          component: FormlyFieldLinkedTableDataEditorComponent,
          wrappers: ['form-field']
        }
      ]
    })
  ]
})
export class FormlyLinkedTableDataEditorModule {}

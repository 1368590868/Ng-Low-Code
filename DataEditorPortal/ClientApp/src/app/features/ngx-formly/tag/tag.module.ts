import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { FormlyModule } from '@ngx-formly/core';

import { TagWrapperComponent } from './tag.type';
import { TagModule } from 'primeng/tag';

@NgModule({
  declarations: [TagWrapperComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TagModule,

    FormlyModule.forChild({
      wrappers: [
        {
          name: 'tag',
          component: TagWrapperComponent
        }
      ]
    })
  ]
})
export class FormlyTagWrapperModule {}

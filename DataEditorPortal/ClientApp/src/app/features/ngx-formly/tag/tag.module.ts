import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { FormlyModule } from '@ngx-formly/core';

import { TagWrapperComponent } from './tag.type';
import { ChipModule } from 'primeng/chip';

@NgModule({
  declarations: [TagWrapperComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ChipModule,

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

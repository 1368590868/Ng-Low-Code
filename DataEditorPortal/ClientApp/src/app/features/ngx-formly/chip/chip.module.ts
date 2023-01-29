import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { FormlyModule } from '@ngx-formly/core';

import { ChipModule } from 'primeng/chip';
import { ChipWrapperComponent } from './chip.type';

@NgModule({
  declarations: [ChipWrapperComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ChipModule,

    FormlyModule.forChild({
      wrappers: [
        {
          name: 'chip',
          component: ChipWrapperComponent
        }
      ]
    })
  ]
})
export class FormlyChipWrapperModule {}

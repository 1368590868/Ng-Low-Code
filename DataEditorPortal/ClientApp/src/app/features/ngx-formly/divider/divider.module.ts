import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { FormlyModule } from '@ngx-formly/core';
import { DividerModule } from 'primeng/divider';

import { DividerWrapperComponent } from './divider.type';

@NgModule({
  declarations: [DividerWrapperComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DividerModule,

    FormlyModule.forChild({
      wrappers: [
        {
          name: 'divider',
          component: DividerWrapperComponent
        }
      ]
    })
  ]
})
export class DividerWrapperModule {}

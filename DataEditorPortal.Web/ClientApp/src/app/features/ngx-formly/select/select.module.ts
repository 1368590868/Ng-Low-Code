import { AsyncPipe, CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { FormlyModule } from '@ngx-formly/core';
import { FormlySelectModule as FormlyCoreSelectModule, FormlySelectOptionsPipe } from '@ngx-formly/core/select';
import { DropdownModule } from 'primeng/dropdown';
import { SkeletonModule } from 'primeng/skeleton';
import { SharedModule } from 'src/app/shared';
import { FormlyFieldSelectComponent } from './select.type';

@NgModule({
  declarations: [FormlyFieldSelectComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DropdownModule,
    SkeletonModule,
    FormlyCoreSelectModule,
    FormlyModule.forChild({
      types: [
        {
          name: 'select',
          component: FormlyFieldSelectComponent,
          wrappers: ['form-field']
        },
        { name: 'enum', extends: 'select' }
      ]
    }),
    SharedModule
  ],
  providers: [FormlySelectOptionsPipe, AsyncPipe]
})
export class FormlySelectModule {}

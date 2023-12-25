import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FormlyModule } from '@ngx-formly/core';
import { ButtonModule } from 'primeng/button';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { FormlyFieldGpsLocatorComponent, GpsLocatorComponent } from './gps-locator.component';
@NgModule({
  declarations: [GpsLocatorComponent, FormlyFieldGpsLocatorComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InputTextModule,
    FormsModule,
    InputNumberModule,
    ButtonModule,
    FormlyModule.forChild({
      types: [
        {
          name: 'gpsLocator',
          component: FormlyFieldGpsLocatorComponent,
          wrappers: ['form-field']
        }
      ]
    })
  ]
})
export class FormlyGpsLocatorModule {}

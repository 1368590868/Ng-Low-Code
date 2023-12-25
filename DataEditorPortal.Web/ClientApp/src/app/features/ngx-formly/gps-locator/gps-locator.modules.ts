import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FormlyModule } from '@ngx-formly/core';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { FormlyFieldGPSLocatorComponent, GPSLocatorComponent } from './gps-locator.component';
@NgModule({
  declarations: [GPSLocatorComponent, FormlyFieldGPSLocatorComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InputTextModule,
    FormsModule,
    InputNumberModule,
    ButtonModule,
    DialogModule,
    TableModule,
    FormlyModule.forChild({
      types: [
        {
          name: 'gpsLocator',
          component: FormlyFieldGPSLocatorComponent,
          wrappers: ['form-field']
        }
      ]
    })
  ]
})
export class FormlyGPSLocatorModule {}

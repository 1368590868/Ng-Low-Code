import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

// primeNG components
import { ToastModule } from 'primeng/toast';

import { CoreModule } from './features/core';
import { FormlyPrimeNGModule } from '@ngx-formly/primeng';
import { FormlyModule } from '@ngx-formly/core';
import { FormlySelectModule } from '@ngx-formly/core/select';
import { FormlyCheckBoxModule } from './features/ngx-formly/checkbox';
import { FormlyDatepickerModule } from './features/ngx-formly/datepicker';
import { FormlyDividerWrapperModule } from './features/ngx-formly/divider';
import { FormlyIconSelectModule } from './features/ngx-formly/iconselect';
import { FormlyInputMaskModule } from './features/ngx-formly/inputMask';
import { FormlyInputNumberModule } from './features/ngx-formly/inputnumber';
import { FormlyMultiSelectModule } from './features/ngx-formly/multiselect';
import { FormlyChipWrapperModule } from './features/ngx-formly/chip';

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    HttpClientModule,
    AppRoutingModule,
    CoreModule,
    ToastModule,
    FormlyModule.forRoot({
      validationMessages: [
        { name: 'required', message: 'This field is required.' }
      ]
    }),
    FormlyPrimeNGModule,
    FormlyDatepickerModule,
    FormlyMultiSelectModule,
    FormlyInputMaskModule,
    FormlySelectModule,
    FormlyDividerWrapperModule,
    FormlyCheckBoxModule,
    FormlyChipWrapperModule,
    FormlyIconSelectModule,
    FormlyInputNumberModule
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}

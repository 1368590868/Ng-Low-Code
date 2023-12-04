import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

// primeNG components
import { ToastModule } from 'primeng/toast';

import { FormlyModule } from '@ngx-formly/core';
import { CoreModule } from './features/core';
import { HttpConfigModule } from './features/http-config/http-config.module';
import { FormlyCustomTypeModule } from './features/ngx-formly/formly-custom.module';

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
    FormlyCustomTypeModule,
    HttpConfigModule.forRoot('windows')
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}

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
import { FormlyModule } from '@ngx-formly/core';
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
    FormlyCustomTypeModule
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}

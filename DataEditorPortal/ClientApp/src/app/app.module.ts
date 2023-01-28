import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { WinAuthInterceptor } from './core/interceptor/win-auth.interceptor';
import { HttpErrorInterceptor } from './core/interceptor/http-error.interceptor';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

// primeNG components
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { MenubarModule } from 'primeng/menubar';
import { AvatarModule } from 'primeng/avatar';
import { DialogModule } from 'primeng/dialog';

import { HeaderComponent } from './core/components/header/header.component';
import { NavMenuComponent } from './core/components/nav-menu/nav-menu.component';
import { AboutComponent } from './core/components/about/about.component';
import { ContactComponent } from './core/components/contact/contact.component';
import { HomeComponent } from './core/components/home/home.component';
import { TileComponent } from './core/components/tile/tile.component';

export { NotifyService } from './core/utils/notify.service';

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    NavMenuComponent,
    AboutComponent,
    ContactComponent,
    HomeComponent,
    TileComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    HttpClientModule,
    AppRoutingModule,
    ButtonModule,
    ToastModule,
    MenubarModule,
    AvatarModule,
    DialogModule
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: WinAuthInterceptor,
      multi: true
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: HttpErrorInterceptor,
      multi: true
    },
    MessageService
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}

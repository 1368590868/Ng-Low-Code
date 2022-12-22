import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule } from '@angular/router';
//Prime Components
import { MessageService } from 'primeng/api';
import { CalendarModule } from 'primeng/calendar';
import { CheckboxModule } from 'primeng/checkbox';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { FileUploadModule } from 'primeng/fileupload';
import { InputTextModule } from 'primeng/inputtext';
import {InputTextareaModule} from 'primeng/inputtextarea'
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { RadioButtonModule } from 'primeng/radiobutton';
import { SplitterModule } from 'primeng/splitter';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import {ConfirmPopupModule} from 'primeng/confirmpopup';
import {ConfirmationService} from 'primeng/api';
import {InputNumberModule} from 'primeng/inputnumber'
import {InputMaskModule} from 'primeng/inputmask'
import {AccordionModule} from 'primeng/accordion';
import {TreeModule} from 'primeng/tree';
import {MultiSelectModule} from 'primeng/multiselect'
import {ListboxModule} from 'primeng/listbox'
import {ProgressBar, ProgressBarModule} from 'primeng/progressbar'

import { AppComponent } from './app.component';
import { AuthGuard } from './auth/auth.guard';
import { LoginComponent } from './auth/login/login.component';
import { NoPermissionComponent } from './auth/no-permission/no-permission.component';
import { UserPermissionGuard } from './auth/user-permission.guard';
import { DataCorrectionDialogs } from './data-correction/data-correction-dialogs.component';
//Own Compoents
import { DataCorrectionComponent } from './data-correction/data-correction.component';
import { HomeComponent } from './home/home.component';
import { WinAuthInterceptor } from './http/win-auth.interceptor';
import { NavMenuComponent } from './nav-menu/nav-menu.component';
import { SearchComponent } from './search/search.component';
import { DataCorrectionService } from './services/data-correction.service';
import { UIService } from './services/UI.service';
import { UserManagerComponent } from './user-manager/user-manager.component';
import { UserService } from './services/user.service';
import { LandBaseComponent } from './land-base/land-base.component';
import { LandBaseService } from './services/land-base.service';
import { LandBaseDialogs } from './land-base/land-base-dialogs.component';
import { GasComponent } from './gas/gas.component';
import { GasDialogs } from './gas/gas-dialogs.component';
import { GasService } from './services/gas.service';
import { ElectricComponent } from './electric/electric.component';
import { ElectricDialogs } from './electric/electric-dialogs.component';
import { ElectricService } from './services/electric.service';
import { UndergroundComponent } from './underground/underground.component';
import { UndergroundDialogs } from './underground/underground-dialogs.component';
import { UndergroundService } from './services/underground.service';
import { WorkOrderComponent } from './work-order/work-order.component'; 
import { WOService } from './services/WO.service';
import { UserManagerDialogs } from './user-manager/user-manager-dialogs.component';
import { ReportComponent } from './report/report.component';
import { ReportService } from './services/report.service';
import { ReviewComponent } from './review/review.component';
import { ReviewService } from './services/review.service';
import { ProjectComponent } from './project/project.component';
import { BatchComponent } from './batch/batch.component';
import { FileNetWOComponent } from './filenetwo/filenetwo.component';
import { FileNetWOService } from './services/filenetwo.service';
import { DCGroupContactComponent } from './dcgroup-contact/dcgroup-contact.component';
import { DCGroupContactService } from './services/dcgroup-contact.service';

import { AppRoutingModule } from './app-routing.module';
import { ActionTableComponent } from './action-table/action-table.component';
import { AboutComponent } from './about/about.component';
import { ContactComponent } from './contact/contact.component';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    DataCorrectionComponent,
    SearchComponent,
    DataCorrectionDialogs,
    NoPermissionComponent,
    LoginComponent,
    UserManagerComponent,
    NavMenuComponent,
    LandBaseComponent,
    LandBaseDialogs,
    GasComponent,
    GasDialogs,
    ElectricComponent,
    ElectricDialogs,
    UndergroundComponent,
    UndergroundDialogs,
    WorkOrderComponent,
    UserManagerDialogs,
    ReportComponent,
    ReviewComponent,
    ProjectComponent,
    BatchComponent,
    FileNetWOComponent,
    DCGroupContactComponent,
    ActionTableComponent,
    AboutComponent,
    ContactComponent

  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    FormsModule,
    AppRoutingModule,
   
    BrowserAnimationsModule,
    ToastModule,
    TableModule,
    SplitterModule,
    DropdownModule,
    DialogModule,
    InputTextModule,
    CalendarModule,
    FileUploadModule,
    CheckboxModule,
    RadioButtonModule,
    ProgressSpinnerModule,
    ProgressBarModule,
    InputTextareaModule,
    ConfirmPopupModule,
    InputNumberModule,
    InputMaskModule,
    AccordionModule,
    TreeModule,
    MultiSelectModule,
    ListboxModule

  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: WinAuthInterceptor,
      multi: true
    },
    UserService, 
    MessageService,
    DataCorrectionService,
    UIService,
    ConfirmationService,
    LandBaseService,
    GasService, 
    UndergroundService, 
    ElectricService, 
    WOService, 
    ReportService,
    ReviewService, 
    FileNetWOService, 
    DCGroupContactService
    
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }

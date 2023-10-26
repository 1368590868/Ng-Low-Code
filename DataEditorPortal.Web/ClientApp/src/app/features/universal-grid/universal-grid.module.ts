import { NgModule } from '@angular/core';
import {
  CommonModule,
  CurrencyPipe,
  DatePipe,
  DecimalPipe,
  PercentPipe
} from '@angular/common';
import { FormsModule } from '@angular/forms';

// formly
import { ReactiveFormsModule } from '@angular/forms';
import { FormlyModule } from '@ngx-formly/core';

import { UniversalGridRoutingModule } from './universal-grid-routing.module';
import { SplitAreaComponent } from './pages/split-area/split-area.component';
import { SearchComponent } from './components/search/search.component';
import { TableComponent } from './components/table/table.component';
import { LinkedTableComponent } from './components/linked-table/linked-table.component';
import { MasterTableComponent } from './components/master-table/master-table.component';
import { LinkedOrMasterComponent } from './pages/linked-or-master';

import { UniversalGridActionModule } from 'src/app/features/universal-grid-action';
import { GridTableService } from './services/grid-table.service';
import { SharedModule } from 'src/app/shared';

// primeNG components
import { AnimateModule } from 'primeng/animate';
import { ToastModule } from 'primeng/toast';
import { MenubarModule } from 'primeng/menubar';
import { AvatarModule } from 'primeng/avatar';
import { SplitterModule } from 'primeng/splitter';
import { DropdownModule } from 'primeng/dropdown';
import { TableModule } from 'primeng/table';
import { CalendarModule } from 'primeng/calendar';
import { SliderModule } from 'primeng/slider';
import { DialogModule } from 'primeng/dialog';
import { MultiSelectModule } from 'primeng/multiselect';
import { ContextMenuModule } from 'primeng/contextmenu';
import { InputTextModule } from 'primeng/inputtext';
import { ProgressBarModule } from 'primeng/progressbar';
import { SplitButtonModule } from 'primeng/splitbutton';
import { RippleModule } from 'primeng/ripple';
import { ButtonModule } from 'primeng/button';
import { PaginatorModule } from 'primeng/paginator';
import { SidebarModule } from 'primeng/sidebar';
import { CheckboxModule } from 'primeng/checkbox';
import { ConfirmPopupModule } from 'primeng/confirmpopup';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';
import { DividerModule } from 'primeng/divider';

@NgModule({
  declarations: [
    SplitAreaComponent,
    SearchComponent,
    TableComponent,
    LinkedTableComponent,
    MasterTableComponent,
    LinkedOrMasterComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    FormlyModule,
    UniversalGridRoutingModule,
    UniversalGridActionModule,
    SharedModule,
    // primeNg
    AnimateModule,
    ToastModule,
    MenubarModule,
    AvatarModule,
    SplitterModule,
    DropdownModule,
    TableModule,
    CalendarModule,
    SliderModule,
    DialogModule,
    MultiSelectModule,
    ContextMenuModule,
    InputTextModule,
    ProgressBarModule,
    SplitButtonModule,
    RippleModule,
    ButtonModule,
    PaginatorModule,
    SidebarModule,
    CheckboxModule,
    ConfirmPopupModule,
    ConfirmDialogModule,
    DividerModule
  ],
  providers: [
    GridTableService,
    DatePipe,
    DecimalPipe,
    CurrencyPipe,
    PercentPipe,
    ConfirmationService
  ]
})
export class UniversalGridModule {}

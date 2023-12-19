import { CommonModule, CurrencyPipe, DatePipe, DecimalPipe, PercentPipe } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';

// formly
import { ReactiveFormsModule } from '@angular/forms';
import { FormlyModule } from '@ngx-formly/core';

import { LinkedTableComponent } from './components/linked-table/linked-table.component';
import { MasterTableComponent } from './components/master-table/master-table.component';
import { SearchComponent } from './components/search/search.component';
import { TableComponent } from './components/table/table.component';
import { PTableCascadeColumnFilterDirective } from './directives/cascade-column-filter.directive';
import { LinkedOrMasterComponent } from './pages/linked-or-master';
import { SplitAreaComponent } from './pages/split-area/split-area.component';
import { GridTableService } from './services/grid-table.service';

import { UniversalGridActionModule } from 'src/app/features/universal-grid-action';
import { SharedModule } from 'src/app/shared';
import { UniversalGridRoutingModule } from './universal-grid-routing.module';

// primeNG components
import { AnimateModule } from 'primeng/animate';
import { ConfirmationService } from 'primeng/api';
import { AvatarModule } from 'primeng/avatar';
import { ButtonModule } from 'primeng/button';
import { CalendarModule } from 'primeng/calendar';
import { CheckboxModule } from 'primeng/checkbox';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmPopupModule } from 'primeng/confirmpopup';
import { ContextMenuModule } from 'primeng/contextmenu';
import { DialogModule } from 'primeng/dialog';
import { DividerModule } from 'primeng/divider';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { MenubarModule } from 'primeng/menubar';
import { MultiSelectModule } from 'primeng/multiselect';
import { PaginatorModule } from 'primeng/paginator';
import { ProgressBarModule } from 'primeng/progressbar';
import { RippleModule } from 'primeng/ripple';
import { SidebarModule } from 'primeng/sidebar';
import { SliderModule } from 'primeng/slider';
import { SplitButtonModule } from 'primeng/splitbutton';
import { SplitterModule } from 'primeng/splitter';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';

@NgModule({
  declarations: [
    SplitAreaComponent,
    SearchComponent,
    TableComponent,
    LinkedTableComponent,
    MasterTableComponent,
    LinkedOrMasterComponent,
    PTableCascadeColumnFilterDirective
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
  providers: [GridTableService, DatePipe, DecimalPipe, CurrencyPipe, PercentPipe, ConfirmationService]
})
export class UniversalGridModule {}

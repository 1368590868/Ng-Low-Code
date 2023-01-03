import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { UniversalGridRoutingModule } from './universal-grid-routing.module';
import { UniversalGridComponent } from './universal-grid.component';
import { SplitAreaComponent } from './pages/split-area/split-area.component';
import { SearchComponent } from './components/search/search.component';
import { TableComponent } from './components/table/table.component';

// primeNG components
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

@NgModule({
  declarations: [
    UniversalGridComponent,
    SplitAreaComponent,
    SearchComponent,
    TableComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    UniversalGridRoutingModule,
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
    ProgressBarModule
  ]
})
export class UniversalGridModule {}

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// formly
import { ReactiveFormsModule } from '@angular/forms';
import { FormlyModule } from '@ngx-formly/core';
import { FormlyPrimeNGModule } from '@ngx-formly/primeng';
import { FormlyDatepickerModule } from '../ngx-formly/datepicker';
import { FormlyMultiSelectModule } from '../ngx-formly/multiselect';
import { FormlyInputMaskModule } from '../ngx-formly/inputMask';
import { FormlySelectModule } from '../ngx-formly/select';
import { FormlyDividerWrapperModule } from '../ngx-formly/divider';
import { FormlyCheckBoxModule } from '../ngx-formly/checkbox';

// primeNG components
import { AnimateModule } from 'primeng/animate';
import { ToastModule } from 'primeng/toast';
import { DropdownModule } from 'primeng/dropdown';
import { TableModule } from 'primeng/table';
import { CalendarModule } from 'primeng/calendar';
import { DialogModule } from 'primeng/dialog';
import { MultiSelectModule } from 'primeng/multiselect';
import { ContextMenuModule } from 'primeng/contextmenu';
import { InputTextModule } from 'primeng/inputtext';
import { ProgressBarModule } from 'primeng/progressbar';
import { SplitButtonModule } from 'primeng/splitbutton';
import { RippleModule } from 'primeng/ripple';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { TreeTableModule } from 'primeng/treetable';
import { TagModule } from 'primeng/tag';
import { MenuModule } from 'primeng/menu';
import { SkeletonModule } from 'primeng/skeleton';
import { KeyFilterModule } from 'primeng/keyfilter';
import { StepsModule } from 'primeng/steps';
import { OrderListModule } from 'primeng/orderlist';
import { PickListModule } from 'primeng/picklist';
import { TooltipModule } from 'primeng/tooltip';
import { DividerModule } from 'primeng/divider';

import { PortalManagementRoutingModule } from './portal-management-routing.module';
import {
  PortalListComponent,
  AddPortalDialogComponent
} from './components/portal-list';
import {
  PortalEditComponent,
  PortalEditBasicComponent,
  PortalEditDatasourceComponent,
  PortalEditColumnsComponent,
  PortalEditSearchComponent,
  PortalEditFormComponent
} from './components/portal-edit';

@NgModule({
  declarations: [
    PortalListComponent,
    AddPortalDialogComponent,
    PortalEditComponent,
    PortalEditBasicComponent,
    PortalEditDatasourceComponent,
    PortalEditColumnsComponent,
    PortalEditSearchComponent,
    PortalEditFormComponent
  ],
  imports: [
    CommonModule,
    PortalManagementRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    FormlyModule.forRoot({
      validationMessages: [
        { name: 'required', message: 'This field is required' }
      ]
    }),
    FormlyPrimeNGModule,
    FormlyDatepickerModule,
    FormlyMultiSelectModule,
    FormlyInputMaskModule,
    FormlySelectModule,
    FormlyDividerWrapperModule,
    FormlyCheckBoxModule,

    // primeNg
    AnimateModule,
    ToastModule,
    DropdownModule,
    TableModule,
    CalendarModule,
    DialogModule,
    MultiSelectModule,
    ContextMenuModule,
    InputTextModule,
    ProgressBarModule,
    SplitButtonModule,
    RippleModule,
    ButtonModule,
    CardModule,
    TreeTableModule,
    TagModule,
    MenuModule,
    SkeletonModule,
    KeyFilterModule,
    StepsModule,
    OrderListModule,
    PickListModule,
    TooltipModule,
    DividerModule
  ]
})
export class PortalManagementModule {}

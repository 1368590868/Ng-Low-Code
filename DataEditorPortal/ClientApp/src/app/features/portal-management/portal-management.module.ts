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
import { FormlyIconSelectModule } from '../ngx-formly/iconselect';
import { FormlyInputNumberModule } from '../ngx-formly/inputnumber';

// primeNG components
import { AnimateModule } from 'primeng/animate';
import { ToastModule } from 'primeng/toast';
import { DropdownModule } from 'primeng/dropdown';
import { TableModule } from 'primeng/table';
import { CalendarModule } from 'primeng/calendar';
import { DialogModule } from 'primeng/dialog';
import { MultiSelectModule } from 'primeng/multiselect';
import { InputTextModule } from 'primeng/inputtext';
import { ProgressBarModule } from 'primeng/progressbar';
import { SplitButtonModule } from 'primeng/splitbutton';
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
import { InputSwitchModule } from 'primeng/inputswitch';
import { InputNumberModule } from 'primeng/inputnumber';
import { ContextMenuModule } from 'primeng/contextmenu';

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
  PortalEditFormComponent,
  SvgDragComponent
} from './components/portal-edit';
import { UniversalGridActionModule } from 'src/app/features/universal-grid-action';

@NgModule({
  declarations: [
    PortalListComponent,
    AddPortalDialogComponent,
    PortalEditComponent,
    PortalEditBasicComponent,
    PortalEditDatasourceComponent,
    PortalEditColumnsComponent,
    PortalEditSearchComponent,
    PortalEditFormComponent,
    SvgDragComponent
  ],
  imports: [
    CommonModule,
    PortalManagementRoutingModule,
    UniversalGridActionModule,
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
    FormlyIconSelectModule,
    FormlyInputNumberModule,

    // primeNg
    AnimateModule,
    ToastModule,
    DropdownModule,
    TableModule,
    CalendarModule,
    DialogModule,
    MultiSelectModule,
    InputTextModule,
    ProgressBarModule,
    SplitButtonModule,
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
    DividerModule,
    InputSwitchModule,
    InputNumberModule,
    ContextMenuModule
  ]
})
export class PortalManagementModule {}

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';

// formly
import { FormlyModule } from '@ngx-formly/core';

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
import { MessageModule } from 'primeng/message';
import { MonacoEditorModule } from 'ngx-monaco-editor';
import { ConfirmDialogModule } from 'primeng/confirmdialog';

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
import { OptionDialogComponent } from './components/option-dialog/option-dialog.component';
import { CustomActionsComponent } from './components/custom-actions/custom-actions.component';
import { SearchRuleComponent } from './components/search-rule/search-rule.component';

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
    SvgDragComponent,
    OptionDialogComponent,
    CustomActionsComponent,
    SearchRuleComponent
  ],
  imports: [
    CommonModule,
    PortalManagementRoutingModule,
    UniversalGridActionModule,
    FormsModule,
    MonacoEditorModule.forRoot(),
    ReactiveFormsModule,
    FormlyModule,

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
    ContextMenuModule,
    MessageModule,
    ConfirmDialogModule
  ]
})
export class PortalManagementModule {}

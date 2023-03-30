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
import { InputTextareaModule } from 'primeng/inputtextarea';
import { ContextMenuModule } from 'primeng/contextmenu';
import { MessageModule } from 'primeng/message';
import { MonacoEditorModule } from 'ngx-monaco-editor';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TabViewModule } from 'primeng/tabview';

import { PortalManagementRoutingModule } from './portal-management-routing.module';
import { UniversalGridActionModule } from 'src/app/features/universal-grid-action';
import {
  PortalListComponent,
  AddPortalDialogComponent,
  PortalEditSingleComponent,
  PortalEditBasicComponent,
  PortalEditDatasourceComponent,
  PortalEditColumnsComponent,
  PortalEditSearchComponent,
  PortalEditFormComponent,
  SvgDragComponent,
  FormlyFieldOptionsEditorComponent,
  OptionDialogComponent,
  CustomActionsComponent,
  FormlyFieldSearchRuleEditorComponent,
  SearchRuleComponent,
  FormlyFieldValidatorEditorComponent,
  FormDesignerViewComponent,
  FormDesignerConfigComponent,
  FROM_DESIGNER_CONTROLS,
  SearchDesignerConfigComponent,
  ValidatorEditorComponent,
  ComputedValueEditorComponent,
  FormlyFieldComputedValueEditorComponent,
  FormLayoutComponent,
  AdvancedQueryDialogComponent,
  DbConnectionDialogComponent,
  FormLayoutDeleteComponent,
  PortalEditLinkedComponent,
  EventConfigComponent
} from './components';
import { MonacoEditorConfig } from './monaco-editor-config';
import { PortalEditStepDirective } from './directives/portal-edit-step.directive';

@NgModule({
  declarations: [
    PortalListComponent,
    AddPortalDialogComponent,
    PortalEditSingleComponent,
    PortalEditStepDirective,
    PortalEditBasicComponent,
    PortalEditDatasourceComponent,
    PortalEditColumnsComponent,
    PortalEditSearchComponent,
    PortalEditFormComponent,
    SvgDragComponent,
    OptionDialogComponent,
    CustomActionsComponent,
    SearchRuleComponent,
    FormlyFieldOptionsEditorComponent,
    FormlyFieldSearchRuleEditorComponent,
    FormlyFieldValidatorEditorComponent,
    FormDesignerViewComponent,
    FormDesignerConfigComponent,
    SearchDesignerConfigComponent,
    ValidatorEditorComponent,
    FormLayoutComponent,
    ComputedValueEditorComponent,
    FormlyFieldComputedValueEditorComponent,
    AdvancedQueryDialogComponent,
    DbConnectionDialogComponent,
    FormLayoutDeleteComponent,
    EventConfigComponent,
    PortalEditLinkedComponent
  ],
  imports: [
    CommonModule,
    PortalManagementRoutingModule,
    UniversalGridActionModule,
    FormsModule,
    MonacoEditorModule.forRoot(MonacoEditorConfig),
    ReactiveFormsModule,
    FormlyModule.forChild({
      types: [
        {
          name: 'optionsEditor',
          component: FormlyFieldOptionsEditorComponent,
          wrappers: ['form-field']
        },
        {
          name: 'searchRuleEditor',
          component: FormlyFieldSearchRuleEditorComponent,
          wrappers: ['form-field']
        },
        {
          name: 'validatorEditor',
          component: FormlyFieldValidatorEditorComponent,
          wrappers: ['form-field']
        },
        {
          name: 'computedValueEditor',
          component: FormlyFieldComputedValueEditorComponent,
          wrappers: ['form-field']
        }
      ]
    }),

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
    InputTextareaModule,
    ContextMenuModule,
    MessageModule,
    ConfirmDialogModule,
    TabViewModule
  ],
  providers: [
    {
      provide: 'FROM_DESIGNER_CONTROLS',
      useValue: FROM_DESIGNER_CONTROLS
    }
  ]
})
export class PortalManagementModule {}

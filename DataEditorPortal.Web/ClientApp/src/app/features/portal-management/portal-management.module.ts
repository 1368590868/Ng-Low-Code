import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

// formly
import { FormlyModule } from '@ngx-formly/core';

// primeNG components
import { MonacoEditorModule } from 'ngx-monaco-editor-v2';
import { AnimateModule } from 'primeng/animate';
import { ButtonModule } from 'primeng/button';
import { CalendarModule } from 'primeng/calendar';
import { CardModule } from 'primeng/card';
import { ChipModule } from 'primeng/chip';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ContextMenuModule } from 'primeng/contextmenu';
import { DialogModule } from 'primeng/dialog';
import { DividerModule } from 'primeng/divider';
import { DropdownModule } from 'primeng/dropdown';
import { FileUploadModule } from 'primeng/fileupload';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputSwitchModule } from 'primeng/inputswitch';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { KeyFilterModule } from 'primeng/keyfilter';
import { MenuModule } from 'primeng/menu';
import { MessageModule } from 'primeng/message';
import { MultiSelectModule } from 'primeng/multiselect';
import { OrderListModule } from 'primeng/orderlist';
import { PickListModule } from 'primeng/picklist';
import { ProgressBarModule } from 'primeng/progressbar';
import { RadioButtonModule } from 'primeng/radiobutton';
import { SkeletonModule } from 'primeng/skeleton';
import { SplitButtonModule } from 'primeng/splitbutton';
import { StepsModule } from 'primeng/steps';
import { TableModule } from 'primeng/table';
import { TabViewModule } from 'primeng/tabview';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { TreeTableModule } from 'primeng/treetable';

import { UniversalGridActionModule } from 'src/app/features/universal-grid-action';
import { SharedModule } from 'src/app/shared';
import { CoreModule } from '../core';
import {
  AddPortalDialogComponent,
  AdvancedQueryDialogComponent,
  ComputedValueEditorComponent,
  CustomActionsComponent,
  EventConfigComponent,
  FileUploadConfigurationComponent,
  FormDesignerConfigComponent,
  FormDesignerViewComponent,
  FormLayoutComponent,
  FormLayoutDeleteComponent,
  FormlyFieldComputedValueEditorComponent,
  FormlyFieldFileUploadConfigurationComponent,
  FormlyFieldGPSLocatorFieldsConfigComponent,
  FormlyFieldGPSLocatorServiceConfigComponent,
  FormlyFieldLocationConfigurationComponent,
  FormlyFieldOptionsEditorComponent,
  FormlyFieldSearchRuleEditorComponent,
  FormlyFieldValidatorEditorComponent,
  GpsLocatorFieldsConfigComponent,
  GpsLocatorServiceConfigComponent,
  LocationConfigurationComponent,
  OptionDialogComponent,
  PortalEditBasicComponent,
  PortalEditBasicSubComponent,
  PortalEditColumnsComponent,
  PortalEditComponent,
  PortalEditDatasourceComponent,
  PortalEditFormComponent,
  PortalEditLinkComponent,
  PortalEditSearchComponent,
  PortalListComponent,
  SearchDesignerConfigComponent,
  SearchRuleComponent,
  SvgDragComponent,
  ValidatorEditorComponent
} from './components';
import { ImportDialogComponent } from './components/portal-list/import-dialog/import-dialog.component';
import { FROM_DESIGNER_CONTROLS } from './directives/form-designer.directive';
import { PortalEditStepDirective } from './directives/portal-edit-step.directive';
import { MonacoEditorConfig } from './monaco-editor-config';
import { PortalManagementRoutingModule } from './portal-management-routing.module';

@NgModule({
  declarations: [
    PortalListComponent,
    AddPortalDialogComponent,
    PortalEditComponent,
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
    FormlyFieldGPSLocatorFieldsConfigComponent,
    FormlyFieldGPSLocatorServiceConfigComponent,
    FormlyFieldLocationConfigurationComponent,
    FormlyFieldFileUploadConfigurationComponent,
    FormlyFieldComputedValueEditorComponent,
    FormDesignerViewComponent,
    FormDesignerConfigComponent,
    SearchDesignerConfigComponent,
    ValidatorEditorComponent,
    FormLayoutComponent,
    ComputedValueEditorComponent,
    AdvancedQueryDialogComponent,
    FormLayoutDeleteComponent,
    EventConfigComponent,
    PortalEditLinkComponent,
    PortalEditBasicSubComponent,
    FileUploadConfigurationComponent,
    LocationConfigurationComponent,
    ImportDialogComponent,
    GpsLocatorServiceConfigComponent,
    GpsLocatorFieldsConfigComponent
  ],
  imports: [
    CoreModule,
    CommonModule,
    SharedModule,
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
        },
        {
          name: 'fileUploadConfig',
          component: FormlyFieldFileUploadConfigurationComponent,
          wrappers: ['form-field']
        },
        {
          name: 'locationConfig',
          component: FormlyFieldLocationConfigurationComponent,
          wrappers: ['form-field']
        },
        {
          name: 'gpsLocatorFieldsConfig',
          component: FormlyFieldGPSLocatorFieldsConfigComponent,
          wrappers: ['form-field']
        },
        {
          name: 'gpsLocatorServiceConfig',
          component: FormlyFieldGPSLocatorServiceConfigComponent,
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
    TabViewModule,
    FileUploadModule,
    ChipModule,
    RadioButtonModule
  ],
  providers: [
    {
      provide: 'FROM_DESIGNER_CONTROLS',
      useValue: FROM_DESIGNER_CONTROLS
    }
  ]
})
export class PortalManagementModule {}

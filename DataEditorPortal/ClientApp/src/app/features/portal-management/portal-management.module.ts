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
import { MonacoEditorModule, NgxMonacoEditorConfig } from 'ngx-monaco-editor';
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
import {
  FormlyFieldOptionsEditorComponent,
  OptionDialogComponent
} from './components/option-dialog/option-dialog.component';
import { CustomActionsComponent } from './components/custom-actions/custom-actions.component';
import {
  FormlyFieldSearchRuleEditorComponent,
  SearchRuleComponent
} from './components/search-rule/search-rule.component';
import { FormlyFieldValidatorEditorComponent } from './components/validator-editor/validator-editor.component';
import { FormDesignerViewComponent } from './components/portal-edit/form-designer/form-designer-view.component';
import {
  FormDesignerConfigComponent,
  FROM_DESIGNER_CONTROLS
} from './components/portal-edit/form-designer/form-designer-config.component';
import { SearchDesignerConfigComponent } from './components/portal-edit/form-designer/search-designer-config.component';
import { ValidatorEditorComponent } from './components/validator-editor/validator-editor.component';

const monacoConfig: NgxMonacoEditorConfig = {
  defaultOptions: {
    theme: 'myTheme',
    language: 'sql',
    lineNumbers: 'off',
    roundedSelection: true,
    minimap: { enabled: false },
    wordWrap: true,
    fixedOverflowWidgets: true,
    contextmenu: false,
    glyphMargin: false,
    lineDecorationsWidth: 0,
    lineNumbersMinChars: 0,
    automaticLayout: true,
    scrollbar: {
      verticalScrollbarSize: 7,
      horizontalScrollbarSize: 7
    }
  },
  onMonacoLoad: () => {
    monaco.editor.defineTheme('myTheme', {
      base: 'vs',
      inherit: true,
      rules: [],
      colors: {
        'editor.background': '#EEEEEE'
      }
    });
  }
};

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
    SearchRuleComponent,
    FormlyFieldOptionsEditorComponent,
    FormlyFieldSearchRuleEditorComponent,
    FormlyFieldValidatorEditorComponent,
    FormDesignerViewComponent,
    FormDesignerConfigComponent,
    SearchDesignerConfigComponent,
    ValidatorEditorComponent
  ],
  imports: [
    CommonModule,
    PortalManagementRoutingModule,
    UniversalGridActionModule,
    FormsModule,
    MonacoEditorModule.forRoot(monacoConfig),
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
    ConfirmDialogModule
  ],
  providers: [
    {
      provide: 'FROM_DESIGNER_CONTROLS',
      useValue: FROM_DESIGNER_CONTROLS
    }
  ]
})
export class PortalManagementModule {}

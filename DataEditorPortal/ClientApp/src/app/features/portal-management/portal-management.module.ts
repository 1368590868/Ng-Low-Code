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
import { TabViewModule } from 'primeng/tabview';
import { FieldsetModule } from 'primeng/fieldset';

import { PortalManagementRoutingModule } from './portal-management-routing.module';
import { UniversalGridActionModule } from 'src/app/features/universal-grid-action';
import {
  PortalListComponent,
  AddPortalDialogComponent,
  PortalEditComponent,
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
  FormLayoutComponent
} from './components';

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
    },
    'semanticHighlighting.enabled': true
  },
  onMonacoLoad: () => {
    const legend = {
      tokenTypes: ['##MACRO##'],
      tokenModifiers: []
    };

    (<any>window).monaco.languages.registerDocumentSemanticTokensProvider(
      'sql',
      {
        getLegend: function () {
          return legend;
        },
        provideDocumentSemanticTokens: function (model: any) {
          const lines = model.getLinesContent();
          const data = [];

          let prevLine = 0;
          let prevChar = 0;

          const tokenPattern = new RegExp('##([a-zA-Z]+[a-zA-Z0-9]+)##', 'g');
          for (let i = 0; i < lines.length; i++) {
            const line = lines[i];

            for (let match = null; (match = tokenPattern.exec(line)); ) {
              data.push(
                // translate line to deltaLine
                i - prevLine,
                // for the same line, translate start to deltaStart
                prevLine === i ? match.index - prevChar : match.index,
                match[0].length,
                0,
                0
              );

              prevLine = i;
              prevChar = match.index;
            }
          }
          return {
            data: new Uint32Array(data),
            resultId: undefined
          };
        },
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        releaseDocumentSemanticTokens: function () {}
      }
    );

    (<any>window).monaco.editor.defineTheme('myTheme', {
      base: 'vs',
      inherit: true,
      rules: [
        { token: '##MACRO##', foreground: '615a60', fontStyle: 'italic bold' }
      ],
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
    ValidatorEditorComponent,
    FormLayoutComponent
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
    ConfirmDialogModule,
    TabViewModule,
    FieldsetModule
  ],
  providers: [
    {
      provide: 'FROM_DESIGNER_CONTROLS',
      useValue: FROM_DESIGNER_CONTROLS
    }
  ]
})
export class PortalManagementModule {}

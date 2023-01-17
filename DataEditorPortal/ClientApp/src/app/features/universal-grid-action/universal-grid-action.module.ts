import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// formly
import { ReactiveFormsModule } from '@angular/forms';
import { FormlyModule } from '@ngx-formly/core';
import { FormlyPrimeNGModule } from '@ngx-formly/primeng';
import { FormlyDatepickerModule } from '../ngx-formly/datepicker';
import { FormlyMultiSelectModule } from '../ngx-formly/multiselect';

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
import { SkeletonModule } from 'primeng/skeleton';
import { AccordionModule } from 'primeng/accordion';
import { DividerModule } from 'primeng/divider';

import { GridActionDirective } from './directives/grid-action.directive';
import { UniversalGridActionDirective } from './directives/universal-grid-action.directive';
import { EditRecordActionComponent } from './components/edit-record-action/edit-record-action.component';
import { ActionWrapperComponent } from './components/action-wrapper/action-wrapper.component';
import { ViewRecordActionComponent } from './components/view-record-action/view-record-action.component';
import { ExportExcelActionComponent } from './components/export-excel-action/export-excel-action.component';
import { RemoveActionComponent } from './components/remove-action/remove-action.component';
import { UserManagerActionComponent } from './components/user-manager-action/user-manager-action.component';
import { PanelWrapperComponent } from './components/user-manager-action/panel-warpper.component';
import { FormlySelectModule } from '../ngx-formly/select/select.module';
import { FormlyCheckBoxModule } from '../ngx-formly/checkbox/checkbox.module';
import { CheckboxModule } from 'primeng/checkbox';
import { ManagerRoleComponent } from './components/manager-role-action/manager-role.component-action';

export * from './models/grid-config';

@NgModule({
  declarations: [
    UniversalGridActionDirective,
    GridActionDirective,
    EditRecordActionComponent,
    ActionWrapperComponent,
    ViewRecordActionComponent,
    ExportExcelActionComponent,
    RemoveActionComponent,
    UserManagerActionComponent,
    PanelWrapperComponent,
    ManagerRoleComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    FormlyModule.forRoot({
      validationMessages: [
        { name: 'required', message: 'This field is required' }
      ],
      wrappers: [{ name: 'panel', component: PanelWrapperComponent }]
    }),
    FormlyPrimeNGModule,
    FormlyDatepickerModule,
    FormlyMultiSelectModule,
    FormlySelectModule,
    FormlyCheckBoxModule,
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
    SkeletonModule,
    AccordionModule,
    CheckboxModule,
    DividerModule
  ],
  exports: [UniversalGridActionDirective],
  providers: [
    {
      provide: 'GRID_ACTION_CONFIG',
      useValue: [
        {
          name: 'add-record',
          component: EditRecordActionComponent,
          wrapper: {
            dialogStyle: { width: '40rem' },
            okText: 'Add'
          },
          props: {
            isAddForm: true
          }
        },
        {
          name: 'edit-record',
          requireGridRowSelected: true,
          component: EditRecordActionComponent,
          wrapper: {
            dialogStyle: { width: '40rem' },
            okText: 'Update'
          }
        },
        {
          name: 'view-record',
          requireGridRowSelected: true,
          component: ViewRecordActionComponent,
          wrapper: {
            header: 'View Info',
            cancelText: '',
            dialogStyle: { width: '40rem' }
          }
        },
        {
          name: 'export-excel',
          component: ExportExcelActionComponent,
          wrapper: {
            header: 'Export to Excel',
            cancelText: 'Cancel',
            okText: 'Export'
          }
        },
        {
          name: 'remove-record',
          requireGridRowSelected: true,
          component: RemoveActionComponent,
          wrapper: {
            header: 'Delete Confirmation',
            cancelText: 'No',
            okText: 'Yes'
          }
        },
        {
          name: 'user-manager',
          requireGridRowSelected: false,
          component: UserManagerActionComponent,
          wrapper: {
            header: 'User Manager',
            dialogStyle: { width: '40rem' },
            cancelText: 'No',
            okText: 'Yes'
          }
        },
        {
          name: 'add-role',
          requireGridRowSelected: false,
          component: ManagerRoleComponent,
          wrapper: {
            header: 'Manage Roles',
            dialogStyle: { width: '40rem' },
            cancelText: 'No',
            okText: 'Yes'
          }
        }
      ]
    }
  ]
})
export class UniversalGridActionModule {}

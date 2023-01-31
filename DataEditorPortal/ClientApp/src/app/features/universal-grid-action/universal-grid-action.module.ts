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
import { FormlySelectModule } from '../ngx-formly/select/select.module';
import { FormlyCheckBoxModule } from '../ngx-formly/checkbox/checkbox.module';
import { CheckboxModule } from 'primeng/checkbox';
import { ManagerRoleComponent } from './components/manage-role-action/manage-role.component-action';
import { FormlyDividerWrapperModule } from '../ngx-formly/divider';
import { UserRoleActionComponent } from './components/user-role-action/user-role-action.component';
import { UserPermissionComponent } from './components/user-permission-action/user-permission-action.component';
import { FormlyChipWrapperModule } from '../ngx-formly/chip/chip.module';

const GRID_ACTION_CONFIG = [
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
    label: 'User Manager',
    isCustom: true,
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
    label: 'Role Manager',
    isCustom: true,
    requireGridRowSelected: false,
    component: ManagerRoleComponent,
    wrapper: {
      header: 'Manage Roles',
      dialogStyle: { width: '40rem' },
      cancelText: 'No',
      okText: 'Yes'
    }
  },
  {
    name: 'edit-role',
    label: 'Edit User Roles',
    isCustom: true,
    requireGridRowSelected: true,
    component: UserRoleActionComponent,
    wrapper: {
      header: 'Edit Roles',
      cancelText: 'No',
      okText: 'Yes'
    }
  },
  {
    name: 'edit-permission',
    label: 'Edit User Permissions',
    isCustom: true,
    requireGridRowSelected: true,
    component: UserPermissionComponent,
    wrapper: {
      dialogStyle: { width: '40rem' },
      header: 'Edit Permission',
      cancelText: 'No',
      okText: 'Yes'
    }
  }
];

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
    ManagerRoleComponent,
    UserRoleActionComponent,
    UserPermissionComponent
  ],
  imports: [
    CommonModule,
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
    FormlySelectModule,
    FormlyCheckBoxModule,
    FormlyDividerWrapperModule,
    FormlyChipWrapperModule,
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
      useValue: GRID_ACTION_CONFIG
    }
  ]
})
export class UniversalGridActionModule {}

export * from './models/grid-config';

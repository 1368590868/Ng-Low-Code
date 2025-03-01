import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

// formly
import { FormlyModule } from '@ngx-formly/core';

// primeNG components
import { AccordionModule } from 'primeng/accordion';
import { AnimateModule } from 'primeng/animate';
import { AvatarModule } from 'primeng/avatar';
import { ButtonModule } from 'primeng/button';
import { CalendarModule } from 'primeng/calendar';
import { CheckboxModule } from 'primeng/checkbox';
import { ContextMenuModule } from 'primeng/contextmenu';
import { DialogModule } from 'primeng/dialog';
import { DividerModule } from 'primeng/divider';
import { DropdownModule } from 'primeng/dropdown';
import { FileUploadModule } from 'primeng/fileupload';
import { InputTextModule } from 'primeng/inputtext';
import { MenubarModule } from 'primeng/menubar';
import { MultiSelectModule } from 'primeng/multiselect';
import { ProgressBarModule } from 'primeng/progressbar';
import { RippleModule } from 'primeng/ripple';
import { SkeletonModule } from 'primeng/skeleton';
import { SliderModule } from 'primeng/slider';
import { SplitButtonModule } from 'primeng/splitbutton';
import { SplitterModule } from 'primeng/splitter';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { TreeModule } from 'primeng/tree';

import { SharedModule } from 'src/app/shared';
import { ActionWrapperComponent } from './components/action-wrapper/action-wrapper.component';
import { EditRecordActionComponent } from './components/edit-record-action/edit-record-action.component';
import { ExportExcelActionComponent } from './components/export-excel-action/export-excel-action.component';
import { ImportExcelActionComponent } from './components/import-excel-action/import-excel-action.component';
import { ImportStatusComponent } from './components/import-excel-action/import-status.component';
import { ManageRoleActionComponent } from './components/manage-role-action/manage-role.component-action';
import { RemoveActionComponent } from './components/remove-action/remove-action.component';
import { UserManagerActionComponent } from './components/user-manager-action/user-manager-action.component';
import { UserPermissionActionComponent } from './components/user-permission-action/user-permission-action.component';
import { UserRoleActionComponent } from './components/user-role-action/user-role-action.component';
import { ViewRecordActionComponent } from './components/view-record-action/view-record-action.component';
import { GridActionDirective } from './directives/grid-action.directive';
import { UniversalGridActionDirective } from './directives/universal-grid-action.directive';
import {
  AsyncQueryTextActionHandler,
  OnAfterSavedDemoActionHandler,
  OnValidateDemoActionHandler
} from './services/event-action-handler.service';

import { EditMultipleRecordActionComponent } from './components/edit-multiple-record-action/edit-multiple-record-action.component';
import { HasErrorPipe } from './components/import-excel-action/import-excel-action.component';
import { GridActionConfig } from './models/grid-config';

const GRID_ACTION_CONFIG: GridActionConfig[] = [
  {
    name: 'add-record',
    component: EditRecordActionComponent,
    wrapper: {
      label: 'Add New',
      icon: 'pi pi-plus',
      header: 'Create new data',
      dialogStyle: { width: '50rem' },
      okText: 'Create'
    },
    props: {
      isAddForm: true
    }
  },
  {
    name: 'edit-multiple-record',
    label: 'Edit Multiple',
    isCustom: true,
    requireGridRowSelected: '> 1',
    component: EditMultipleRecordActionComponent,
    wrapper: {
      label: 'Edit Multiple',
      icon: 'pi pi-file-edit',
      buttonStyleClass: 'p-button-outlined',
      header: 'Update multiple data details',
      dialogStyle: { width: '50rem' },
      okText: 'Update'
    }
  },
  {
    name: 'edit-record',
    requireGridRowSelected: true,
    component: EditRecordActionComponent,
    wrapper: {
      header: 'Update data details',
      dialogStyle: { width: '50rem' },
      okText: 'Update'
    }
  },
  {
    name: 'view-record',
    requireGridRowSelected: true,
    component: ViewRecordActionComponent,
    wrapper: {
      header: 'View data details',
      cancelText: '',
      dialogStyle: { width: '65rem' },
      dialogModal: false
    }
  },
  {
    name: 'export-excel',
    requireGridSearch: true,
    component: ExportExcelActionComponent,
    wrapper: {
      label: 'Export To Excel',
      icon: 'pi pi-file-excel',
      buttonStyleClass: 'p-button-outlined',
      header: 'Export to Excel',
      cancelText: 'Cancel',
      okText: 'Export'
    }
  },
  {
    name: 'import-excel',
    label: 'Import From Excel',
    component: ImportExcelActionComponent,
    isCustom: true,
    wrapper: {
      label: 'Impot From Excel',
      icon: 'pi pi-file-import',
      buttonStyleClass: 'p-button-outlined',
      header: 'Import From Excel',
      cancelText: 'Cancel',
      okText: 'Import',
      dialogStyle: { width: '90rem', height: '50.625rem' },
      dialogHideFooter: true
    }
  },
  {
    name: 'remove-record',
    requireGridRowSelected: true,
    component: RemoveActionComponent,
    wrapper: {
      label: 'Remove',
      icon: 'pi pi-trash',
      buttonStyleClass: 'p-button-outlined p-button-danger',
      header: 'Delete Confirmation',
      dialogContentStyleClass: 'pb-0 flex flex-column',
      cancelText: 'No',
      okText: 'Yes'
    }
  },
  {
    name: 'user-manager-add',
    label: 'Add User',
    isCustom: true,
    requireGridRowSelected: false,
    component: UserManagerActionComponent,
    wrapper: {
      label: 'New User',
      icon: 'pi pi-plus',
      header: 'Create User',
      dialogStyle: { width: '50rem' },
      okText: 'Create User'
    },
    props: {
      isAddForm: true
    }
  },
  {
    name: 'user-manager-edit',
    label: 'Edit User',
    isCustom: true,
    requireGridRowSelected: true,
    component: UserManagerActionComponent,
    wrapper: {
      label: 'Edit User',
      icon: 'pi pi-pencil',
      buttonStyleClass: 'p-button-outlined',
      header: 'Update User details',
      dialogStyle: { width: '50rem' },
      okText: 'Update User'
    }
  },
  {
    name: 'manage-roles',
    label: 'Manage Roles',
    isCustom: true,
    requireGridRowSelected: false,
    component: ManageRoleActionComponent,
    wrapper: {
      label: 'Manage Roles',
      icon: 'pi pi-users',
      buttonStyleClass: 'p-button-outlined',
      header: 'Manage Roles',
      dialogStyle: { width: '50rem' },
      cancelText: 'Cancel',
      okText: 'Save'
    }
  },
  {
    name: 'edit-role',
    label: 'Edit User Roles',
    isCustom: true,
    requireGridRowSelected: 1,
    component: UserRoleActionComponent,
    wrapper: {
      label: 'Edit User Roles',
      icon: 'pi pi-user-edit',
      buttonStyleClass: 'p-button-outlined',
      header: 'Edit User Roles',
      okText: 'Update User Roles'
    }
  },
  {
    name: 'edit-permission',
    label: 'Edit User Permissions',
    isCustom: true,
    requireGridRowSelected: 1,
    component: UserPermissionActionComponent,
    wrapper: {
      label: 'Edit User Permissions',
      icon: 'pi pi-list',
      buttonStyleClass: 'p-button-outlined',
      header: 'Edit User Permissions',
      okText: 'Update User Permissions',
      dialogStyle: { width: '50rem' }
    }
  }
];
const EVENT_ACTION_CONFIG = [
  {
    name: 'On Validate Demo',
    handler: OnValidateDemoActionHandler
  },
  {
    name: 'On After Saved Demo',
    handler: OnAfterSavedDemoActionHandler
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
    ManageRoleActionComponent,
    UserRoleActionComponent,
    UserPermissionActionComponent,
    ImportExcelActionComponent,
    HasErrorPipe,
    ImportStatusComponent,
    EditMultipleRecordActionComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    FormlyModule,
    SharedModule,
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
    DividerModule,
    TreeModule,
    FileUploadModule,
    TagModule
  ],
  exports: [UniversalGridActionDirective],
  providers: [
    {
      provide: 'GRID_ACTION_CONFIG',
      useValue: GRID_ACTION_CONFIG
    },
    {
      provide: 'EVENT_ACTION_CONFIG',
      useValue: EVENT_ACTION_CONFIG
    },
    EVENT_ACTION_CONFIG.map(x => x.handler),
    AsyncQueryTextActionHandler
  ]
})
export class UniversalGridActionModule {}

export * from './models/grid-config';

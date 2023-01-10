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

import { GridActionDirective } from './directives/grid-action.directive';
import { UniversalGridActionDirective } from './directives/universal-grid-action.directive';
import { EditRecordActionComponent } from './components/edit-record-action/edit-record-action.component';
import { ActionWrapperComponent } from './components/action-wrapper/action-wrapper.component';
import { ViewRecordActionComponent } from './components/view-record-action/view-record-action.component';

export * from './models/grid-config';

@NgModule({
  declarations: [
    UniversalGridActionDirective,
    GridActionDirective,
    EditRecordActionComponent,
    ActionWrapperComponent,
    ViewRecordActionComponent
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
    SkeletonModule
  ],
  exports: [UniversalGridActionDirective],
  providers: [
    {
      provide: 'GRID_ACTION_CONFIG',
      useValue: [
        {
          name: 'addEdit',
          requireGridRowSelected: true,
          component: EditRecordActionComponent
        },
        {
          name: 'edit-record',
          requireGridRowSelected: true,
          component: EditRecordActionComponent,
          wrapper: {
            dialogStyle: { width: '40rem' }
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
        }
      ]
    }
  ]
})
export class UniversalGridActionModule {}

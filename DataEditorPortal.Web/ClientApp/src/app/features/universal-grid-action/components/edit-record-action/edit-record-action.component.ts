import {
  Component,
  Inject,
  Injector,
  Input,
  OnInit,
  Type,
  ViewChild
} from '@angular/core';
import { FormGroup, NgForm } from '@angular/forms';
import { FormlyFieldConfig, FormlyFormOptions } from '@ngx-formly/core';
import { tap } from 'rxjs';
import {
  NgxFormlyService,
  NotifyService,
  SystemLogService
} from 'src/app/shared';
import { GridActionDirective } from '../../directives/grid-action.directive';
import { EditFormData } from '../../models/edit';
import {
  TrueOnValidateActionHandler,
  FalseOnAfterActionHandler,
  EventActionHandlerService
} from '../../services/event-action-handler.service';
import { UniversalGridService } from '../../services/universal-grid.service';

@Component({
  selector: 'app-edit-record-action',
  templateUrl: './edit-record-action.component.html',
  styleUrls: ['./edit-record-action.component.scss'],
  providers: [
    EventActionHandlerService,
    TrueOnValidateActionHandler,
    FalseOnAfterActionHandler
  ]
})
export class EditRecordActionComponent
  extends GridActionDirective
  implements OnInit
{
  @Input() isAddForm = false;

  form = new FormGroup({});
  options: FormlyFormOptions = {};
  model = {};
  fields!: FormlyFieldConfig[];

  eventActionHandler = {
    onValidate: {
      eventType: 'Javascript',
      script: 'True OnValidate'
    },
    afterSaved: {
      eventType: 'Javascript',
      script: 'False OnAfter'
    }
  };

  @ViewChild('editForm') editForm!: NgForm;

  constructor(
    private gridService: UniversalGridService,
    private notifyService: NotifyService,
    private ngxFormlyService: NgxFormlyService,
    private systemLogService: SystemLogService,
    private injector: Injector,
    @Inject('EVENT_ACTION_CONFIG')
    private EVENT_ACTION_CONFIG: {
      name: string;
      handler: Type<EventActionHandlerService>;
    }[]
  ) {
    super();
  }

  ngOnInit(): void {
    if (!this.isAddForm) {
      const dataKey = this.selectedRecords[0][this.recordKey];
      this.gridService
        .getDetailData(dataKey)
        .pipe(
          tap(result => {
            Object.keys(result).forEach(key => {
              if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}.*/.test(result[key])) {
                result[key] = new Date(result[key]);
              }
            });
            this.model = result;
          }),
          tap(() => this.getFormConfig())
        )
        .subscribe();
    } else {
      this.getFormConfig();
    }
  }

  getFormConfig() {
    this.gridService
      .getDetailConfig(this.isAddForm ? 'ADD' : 'UPDATE')
      .pipe(
        tap(result => {
          // fetch lookups
          const fields = result as FormlyFieldConfig[];
          fields
            .filter(
              // advanced setting: options from lookup
              x =>
                typeof x.type === 'string' &&
                ['select', 'multiSelect'].indexOf(x.type) >= 0 &&
                x.props &&
                x.props['optionsLookup']
            )
            .forEach(f => {
              if (f.props) {
                f.props.placeholder = 'Please Select';
                if (!f.props.options) f.props.options = [];

                if (Array.isArray(f.props['optionsLookup'])) {
                  f.props.options = f.props['optionsLookup'];
                } else {
                  f.hooks = {
                    onInit: field => {
                      if (
                        field.props &&
                        field.props['dependOnFields'] &&
                        field.props['dependOnFields'].length > 0
                      ) {
                        this.ngxFormlyService.initDependOnFields(field);
                      } else {
                        this.ngxFormlyService.initFieldOptions(field);
                      }
                    }
                  };
                }
              }
            });

          fields
            .filter(
              (x: any) => x.validatorConfig && Array.isArray(x.validatorConfig)
            )
            .forEach(x => this.ngxFormlyService.initValidators(x));
          this.fields = fields;
          if (fields.length > 0) this.loadedEvent.emit();
        })
      )
      .subscribe();
  }

  submitSave(model: EditFormData) {
    if (this.isAddForm) {
      this.systemLogService.addSiteVisitLog({
        action: 'Add New',
        section: this.gridService.currentPortalItem,
        params: JSON.stringify(model)
      });

      this.gridService.addGridData(model).subscribe(res => {
        if (!res.isError && res.result) {
          this.notifyService.notifySuccess(
            'Success',
            'Save Successfully Completed.'
          );
          this.savedEvent.emit();
          this.sendEventActionHandler(model, 'afterSaved');
        } else {
          this.errorEvent.emit();
        }
      });
    } else {
      const dataKey = this.selectedRecords[0][this.recordKey];
      this.systemLogService.addSiteVisitLog({
        action: 'Update',
        section: this.gridService.currentPortalItem,
        params: JSON.stringify(model)
      });
      this.gridService.updateGridData(dataKey, this.model).subscribe(res => {
        if (!res.isError && res.result) {
          this.notifyService.notifySuccess(
            'Success',
            'Save Successfully Completed.'
          );
          this.savedEvent.emit();
          this.sendEventActionHandler(model, 'afterSaved');
        } else {
          this.errorEvent.emit();
        }
      });
    }
  }

  sendEventActionHandler(
    model: EditFormData,
    eventActionHandler: 'onValidate' | 'afterSaved'
  ) {
    if (
      this.eventActionHandler[eventActionHandler].eventType === 'Javascript'
    ) {
      const action = this.EVENT_ACTION_CONFIG.find(
        x => x.name === this.eventActionHandler[eventActionHandler].script
      );
      const result = this.injector.get(action?.handler);
      result.excuteAction().subscribe((res: boolean) => {
        if (res) {
          eventActionHandler === 'onValidate' && this.submitSave(model);
        } else {
          eventActionHandler === 'onValidate' && this.errorEvent.emit();
        }
      });
    } else {
      if (eventActionHandler === 'onValidate') {
        this.submitSave(model);
      }
    }
  }

  onFormSubmit(model: EditFormData) {
    if (this.form.valid) {
      // OnValidate| Javascript Execute
      this.sendEventActionHandler(model, 'onValidate');
    } else {
      this.errorEvent.emit();
    }
  }

  onSave(): void {
    this.editForm.onSubmit(new Event('submit'));
  }

  onCancel(): void {
    this.fields = [];
    this.form.reset(undefined, { emitEvent: false });
    // this.options.resetModel?.();
  }
}

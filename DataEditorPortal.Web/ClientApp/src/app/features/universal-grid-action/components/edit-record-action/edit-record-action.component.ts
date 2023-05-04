import { DatePipe } from '@angular/common';
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
import { Subject, tap } from 'rxjs';
import {
  NgxFormlyService,
  NotifyService,
  SystemLogService
} from 'src/app/shared';
import { GridActionDirective } from '../../directives/grid-action.directive';
import {
  EditFormData,
  FormEventConfig,
  FormEventMeta
} from '../../models/edit';
import {
  AsyncQueryTextActionHandler,
  EventActionHandlerService
} from '../../services/event-action-handler.service';
import { UniversalGridService } from '../../services/universal-grid.service';
import * as qs from 'qs';

@Component({
  selector: 'app-edit-record-action',
  templateUrl: './edit-record-action.component.html',
  styleUrls: ['./edit-record-action.component.scss'],
  providers: [DatePipe]
})
export class EditRecordActionComponent
  extends GridActionDirective
  implements OnInit
{
  @Input() isAddForm = false;
  @Input() layout: 'vertical' | 'horizontal' = 'horizontal';
  destroy$ = new Subject<void>();

  form = new FormGroup({});
  options: FormlyFormOptions = {};
  model = {};
  fields!: FormlyFieldConfig[];
  dataKey?: string;

  eventConfig?: FormEventConfig;

  @ViewChild('editForm') editForm!: NgForm;

  constructor(
    private gridService: UniversalGridService,
    private notifyService: NotifyService,
    private ngxFormlyService: NgxFormlyService,
    private systemLogService: SystemLogService,
    private datePipe: DatePipe,
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
      this.dataKey = this.selectedRecords[0][this.recordKey];
      this.gridService
        .getDetailData(this.gridName, this.dataKey as string)
        .pipe(
          tap(result => {
            Object.keys(result).forEach(key => {
              if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}.*/.test(result[key])) {
                result[key] = new Date(result[key]);
              }
            });
            this.model = result;
            this.onUrlParamsChange();
          }),
          tap(() => this.getFormConfig()),
          tap(() => this.getEventConfig())
        )
        .subscribe();
    } else {
      this.getFormConfig();
      this.getEventConfig();
    }
  }

  onUrlParamsChange() {
    const urlParams = qs.parse(window.location.search, {
      ignoreQueryPrefix: true
    });

    if (Object.keys(urlParams).length > 0) {
      const action = Object.keys(urlParams);
      action.forEach(key => {
        if (key === 'edit') {
          const editData = urlParams[key] as any;
          this.model = { ...this.model, ...editData };
        }
        if (key === 'add') {
          const addData = urlParams[key] as any;
          this.model = { ...this.model, ...addData };
        }
      });
    }
  }

  getFormConfig() {
    this.gridService
      .getFormConfig(this.gridName, this.isAddForm ? 'ADD' : 'UPDATE')
      .pipe(
        tap(result => {
          const fields = result as FormlyFieldConfig[];
          this.configFieldDefaultValue(fields);
          this.configFieldLookup(fields);
          this.configFieldValidator(fields);
          this.configFieldExpressions(fields);
          this.configFieldProps(fields);
          this.fields = fields;
          this.onUrlParamsChange();

          if (fields.length > 0) this.loadedEvent.emit();
        })
      )
      .subscribe();
  }

  private configFieldLookup(fields: FormlyFieldConfig[]) {
    // fetch lookups
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
            this.ngxFormlyService.initFieldLookup(f, this.destroy$);
          }
        }
      });
  }
  private configFieldDefaultValue(fields: FormlyFieldConfig[]) {
    // set default value
    fields
      .filter(f => f.defaultValue)
      .forEach(f => {
        const matches = [
          ...f.defaultValue.matchAll(
            /##SEARCHES[.]{1}([a-zA-Z]{1}[a-zA-Z0-9_]+?)([:]{1}([a-zA-Z]{1}[a-zA-Z0-9_]+?))*##/g
          )
        ];
        let value = f.defaultValue;
        matches.forEach(match => {
          let searchVal = this.fetchDataParam?.searches
            ? this.fetchDataParam?.searches[match[1]]
            : '';
          if (searchVal && searchVal.getDate)
            searchVal = this.datePipe.transform(
              searchVal,
              match[3] ?? 'yyyyMMdd'
            );
          value = value.replace(match[0], searchVal ?? '');
        });
        f.defaultValue = value;
      });
  }
  private configFieldValidator(fields: FormlyFieldConfig[]) {
    // set validators
    fields
      .filter((x: any) => x.validatorConfig && Array.isArray(x.validatorConfig))
      .forEach(x => {
        this.ngxFormlyService.initValidators(x, this.destroy$);
      });
  }
  private configFieldProps(fields: FormlyFieldConfig[]) {
    // set props for linkDataEditor
    fields
      .filter(f => f.type === 'linkDataEditor')
      .forEach(x => {
        if (x.props) {
          x.props['table1Name'] = this.gridName;
          x.props['searchParams'] = this.fetchDataParam?.searches;
          x.props['table1Id'] = this.dataKey;
        }
      });
    // set props for checkbox
    fields
      .filter(f => f.type === 'checkbox')
      .forEach(x => {
        if (x.props) {
          x.props['hideLabel'] = this.layout === 'vertical';
        }
      });
    // set props for fileUpload
    fields
      .filter(f => f.type === 'fileUpload')
      .forEach(x => {
        if (x.props) {
          x.props['gridName'] = this.gridName;
        }
      });
  }
  private configFieldExpressions(fields: FormlyFieldConfig[]) {
    // set expressions
    fields
      .filter((x: any) => x.expressionsConfig)
      .forEach((x: any) => {
        x.expressions = {};
        Object.keys(x.expressionsConfig).forEach(key => {
          x.expressions[key.replace('_', '.')] = x.expressionsConfig[key];
        });
        x.expressionsConfig = undefined;
      });
  }

  getEventConfig() {
    this.gridService
      .getEventConfig(this.gridName, this.isAddForm ? 'ADD' : 'UPDATE')
      .pipe(
        tap(result => {
          this.eventConfig = result;
        })
      )
      .subscribe();
  }

  submitSave(model: EditFormData) {
    if (this.isAddForm) {
      this.systemLogService.addSiteVisitLog({
        action: 'Add New',
        section: this.gridName,
        params: JSON.stringify(model)
      });

      this.gridService.addGridData(this.gridName, model).subscribe(res => {
        if (!res.isError && res.result) {
          this.notifyService.notifySuccess(
            'Success',
            'Save Successfully Completed.'
          );

          // run after saved event if configured.
          const handler = this.getEventActionHandler(
            this.eventConfig?.afterSaved
          );
          if (handler) handler.excuteAction().subscribe();

          this.savedEvent.emit();
        } else {
          this.errorEvent.emit();
        }
      });
    } else {
      this.systemLogService.addSiteVisitLog({
        action: 'Update',
        section: this.gridName,
        params: JSON.stringify(model)
      });
      this.gridService
        .updateGridData(this.gridName, this.dataKey as string, this.model)
        .subscribe(res => {
          if (!res.isError && res.result) {
            this.notifyService.notifySuccess(
              'Success',
              'Save Successfully Completed.'
            );

            // run after saved event if configured.
            const handler = this.getEventActionHandler(
              this.eventConfig?.afterSaved
            );
            if (handler) handler.excuteAction().subscribe();

            this.savedEvent.emit();
          } else {
            this.errorEvent.emit();
          }
        });
    }
  }

  getEventActionHandler(eventConfig?: FormEventMeta) {
    if (eventConfig && eventConfig.eventType === 'Javascript') {
      const action = this.EVENT_ACTION_CONFIG.find(
        x => x.name === eventConfig.script
      );
      if (action) return this.injector.get(action?.handler);
    }
    if (
      (eventConfig && eventConfig.eventType === 'QueryText') ||
      (eventConfig && eventConfig.eventType === 'QueryStoredProcedure')
    ) {
      return this.injector.get(AsyncQueryTextActionHandler);
    }
    return null;
  }

  onFormSubmit(model: EditFormData) {
    (this.editForm.form as any)._updateTreeValidity({ emitEvent: false });
    if (this.form.valid) {
      // run on validate event if configured
      const handler = this.getEventActionHandler(this.eventConfig?.onValidate);
      if (handler) {
        handler
          .excuteAction({
            name: this.gridName,
            type: this.isAddForm ? 'ADD' : 'UPDATE',
            data: model,
            id: this.dataKey,
            errorMsg: 'Validation failed. Please check your data.'
          })
          .subscribe((res: boolean) => {
            if (res) this.submitSave(model);
            else this.errorEvent.emit();
          });
      } else {
        this.submitSave(model);
      }
    } else {
      this.fields.forEach(x => x.formControl?.markAsDirty());
      this.errorEvent.emit();
    }
  }

  onSave(): void {
    this.editForm.onSubmit(new Event('submit'));
  }

  onCancel(): void {
    this.destroy$.next();
    this.form.reset(undefined, { emitEvent: false });
  }
}

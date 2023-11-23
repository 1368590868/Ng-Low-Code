import { DatePipe } from '@angular/common';
import {
  Component,
  Inject,
  Input,
  OnInit,
  Type,
  ViewChild
} from '@angular/core';
import { FormGroup, NgForm } from '@angular/forms';
import { FormlyFieldConfig, FormlyFormOptions } from '@ngx-formly/core';
import { cloneDeep, isEqual } from 'lodash-es';
import { Subject, forkJoin, tap } from 'rxjs';
import {
  NgxFormlyService,
  NotifyService,
  SystemLogService
} from 'src/app/shared';
import { GridActionDirective } from '../../directives/grid-action.directive';
import { EditFormData, FormEventConfig } from '../../models/edit';
import { EventActionHandlerService } from '../../services/event-action-handler.service';
import { UniversalGridService } from '../../services/universal-grid.service';

@Component({
  selector: 'app-edit-multiple-record-action',
  templateUrl: './edit-multiple-record-action.component.html',
  styleUrls: ['./edit-multiple-record-action.component.scss'],
  providers: [DatePipe]
})
export class EditMultipleRecordActionComponent
  extends GridActionDirective
  implements OnInit
{
  @Input() isAddForm = false;
  @Input() layout: 'vertical' | 'horizontal' = 'horizontal';
  destroy$ = new Subject<void>();

  form = new FormGroup({});
  options: FormlyFormOptions = {};
  model: EditFormData = {};
  fields!: FormlyFieldConfig[];
  dataKeys: string[] = [];
  backModel = {};

  eventConfig?: FormEventConfig;

  @ViewChild('editForm') editForm!: NgForm;

  constructor(
    private gridService: UniversalGridService,
    private notifyService: NotifyService,
    private ngxFormlyService: NgxFormlyService,
    private systemLogService: SystemLogService,
    private datePipe: DatePipe,
    @Inject('EVENT_ACTION_CONFIG')
    private EVENT_ACTION_CONFIG: {
      name: string;
      handler: Type<EventActionHandlerService>;
    }[]
  ) {
    super();
  }

  override isFormUnmodified = () => {
    return isEqual(this.model, this.backModel);
  };

  ngOnInit(): void {
    if (!this.isAddForm) {
      this.dataKeys = this.selectedRecords.map((x: any) => x[this.recordKey]);
      forkJoin([
        this.gridService.batchGet(this.gridName, this.dataKeys),
        this.gridService.getSearchConfig(this.gridName)
      ])
        .pipe(
          tap(([result, searchConfig]) => {
            Object.keys(result).forEach(key => {
              if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}.*/.test(result[key])) {
                result[key] = new Date(result[key]);
              }
            });
            this.onLoadUrlParams();
            this.searchConfig(searchConfig);

            this.model = result;
          }),
          tap(() => this.getFormConfig()),
          tap(() => this.getEventConfig())
        )
        .subscribe();
    }
  }

  searchConfig(searchConfig: any) {
    const formSearch: any = {};
    searchConfig.forEach((x: any) => {
      let key = x.key;
      if (x.searchRule && x.searchRule.field) {
        key = x.searchRule.field;
      }
      if (this.fetchDataParam?.searches) {
        const value = this.fetchDataParam?.searches[x.key];
        if (value) {
          formSearch[key] = value;
        }
      }
    });
    this.model = { ...this.model, ...formSearch };
  }

  onLoadUrlParams() {
    if (this.initParams && this.initParams?.payload) {
      this.model = { ...this.model, ...this.initParams.payload };
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

          if (fields.length > 0) this.loadedEvent.emit();
        }),
        tap(() => {
          this.setBackupModel();
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
      .filter(
        f =>
          (f.type === 'input' || f.type === 'textarea') &&
          f.defaultValue &&
          typeof f.defaultValue === 'string'
      )
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
        }
      });
    // set props for checkbox
    fields
      .filter(f => f.type === 'checkbox')
      .forEach(x => {
        if (x.defaultValue === undefined) x.defaultValue = false;
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

    // use multiple edit wrapper
    fields.forEach((x: any) => {
      x.wrappers = ['form-field-multiple'];

      if ((x.key as string) in this.model) {
        if (x.props) x.props['isSameValue'] = true;
      }
    });

    setTimeout(() => {
      this.setBackupModel();
    });
  }
  private configFieldExpressions(fields: FormlyFieldConfig[]) {
    // set expressions
    fields
      .filter((x: any) => x.expressionsConfig)
      .forEach((x: any) => {
        try {
          x.expressions = JSON.parse(x.expressionsConfig);
        } catch {
          /* empty */
        }
        x.expressionsConfig = undefined;
      });
  }

  getEventConfig() {
    this.gridService
      .getEventConfig(this.gridName, this.isAddForm ? 'ADD' : 'UPDATE')
      .pipe(
        tap(result => {
          this.eventConfig = result;
        }),
        tap(() => {
          this.setBackupModel();
        })
      )
      .subscribe();
  }

  setBackupModel() {
    if (Object.keys(this.model).length !== 0)
      this.backModel = cloneDeep(this.model);
  }

  submitSave(model: EditFormData) {
    this.systemLogService.addSiteVisitLog({
      action: 'Update',
      section: this.gridName,
      params: JSON.stringify(model)
    });

    const data: EditFormData = {};
    this.fields.forEach(f => {
      if (f.props && f.props['isSameValue'] && f.key) {
        data[f.key as string] = this.model[f.key as string];
      }
    });

    this.gridService
      .batchUpdate(this.gridName, this.dataKeys, data)
      .subscribe(res => {
        if (res.code === 200 && res.data) {
          this.notifyService.notifySuccess(
            'Success',
            'Save Successfully Completed.'
          );

          this.savedEvent.emit();
        } else {
          this.errorEvent.emit();
        }
      });
  }

  onFormSubmit(model: EditFormData) {
    (this.editForm.form as any)._updateTreeValidity({ emitEvent: false });
    if (this.form.valid) {
      this.submitSave(model);
    } else {
      setTimeout(() => {
        this.fields.forEach(x => x.formControl?.markAsDirty());
      });
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

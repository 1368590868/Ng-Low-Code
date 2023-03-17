import { Component, Input, OnInit, ViewChild } from '@angular/core';
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
import { UniversalGridService } from '../../services/universal-grid.service';

@Component({
  selector: 'app-edit-record-action',
  templateUrl: './edit-record-action.component.html',
  styleUrls: ['./edit-record-action.component.scss']
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

  @ViewChild('editForm') editForm!: NgForm;

  constructor(
    private gridService: UniversalGridService,
    private notifyService: NotifyService,
    private ngxFormlyService: NgxFormlyService,
    private systemLogService: SystemLogService
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

  onFormSubmit(model: EditFormData) {
    if (this.form.valid) {
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
          } else {
            this.errorEvent.emit();
          }
        });
      }
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

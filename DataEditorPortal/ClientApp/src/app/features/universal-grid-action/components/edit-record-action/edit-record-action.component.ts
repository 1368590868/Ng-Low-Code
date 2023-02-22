import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { FormGroup, NgForm } from '@angular/forms';
import { FormlyFieldConfig, FormlyFormOptions } from '@ngx-formly/core';
import { tap } from 'rxjs';
import { NgxFormlyService, NotifyService } from 'src/app/shared';
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
    private ngxFormlyService: NgxFormlyService
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
                x.props['optionLookup']
            )
            .forEach(f => {
              if (f.props) {
                f.props.placeholder = 'Please Select';
                if (!f.props.options) f.props.options = [];
              }
              f.hooks = {
                onInit: field => {
                  if (field.props && field.props['dependOnFields']) {
                    this.ngxFormlyService.initDependOnFields(field);
                  } else {
                    this.ngxFormlyService.initFieldOptions(field);
                  }
                }
              };
            });

          this.fields = fields;
          this.loadedEvent.emit();
        })
      )
      .subscribe();
  }

  onFormSubmit(model: EditFormData) {
    if (this.form.valid) {
      if (this.isAddForm) {
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

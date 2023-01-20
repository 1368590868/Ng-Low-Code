import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { FormGroup, NgForm } from '@angular/forms';
import { FormlyFieldConfig, FormlyFormOptions } from '@ngx-formly/core';
import { tap } from 'rxjs';
import { NotifyService } from 'src/app/core/utils/notify.service';
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
    private notifyService: NotifyService
  ) {
    super();
  }

  ngOnInit(): void {
    this.gridService
      .getDetailConfig()
      .pipe(
        tap(result => {
          this.fields = result;
          this.loadedEvent.emit();
        })
      )
      .subscribe();

    if (!this.isAddForm) {
      const dataKey = this.selectedRecords[0][this.recordKey];

      this.gridService
        .getDetailData(dataKey)
        .pipe(
          tap((result: any) => {
            this.model = result;
          })
        )
        .subscribe();
    }
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
    this.options.resetModel?.();
    this.fields = [];
  }
}

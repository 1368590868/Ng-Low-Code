import { Component, Input, ViewChild } from '@angular/core';
import { FormGroup, NgForm } from '@angular/forms';
import { FormlyFieldConfig, FormlyFormOptions } from '@ngx-formly/core';
import { tap } from 'rxjs';
import {
  OnGridActionSave,
  OnGridActionCancel,
  GridActionDirective,
  OnGridActionDialogShow
} from '../../directives/grid-action.directive';
import { UniversalGridService } from '../../services/universal-grid.service';

@Component({
  selector: 'app-edit-record-action',
  templateUrl: './edit-record-action.component.html',
  styleUrls: ['./edit-record-action.component.scss']
})
export class EditRecordActionComponent
  extends GridActionDirective
  implements OnGridActionSave, OnGridActionCancel, OnGridActionDialogShow
{
  @Input() isAddForm = false;

  form = new FormGroup({});
  options: FormlyFormOptions = {};
  model = {};
  fields!: FormlyFieldConfig[];

  @ViewChild('editForm') editForm!: NgForm;

  constructor(private gridService: UniversalGridService) {
    super();
  }

  onDialogShow(): void {
    this.gridService
      .getDetailConfig()
      .pipe(
        tap((result: any) => {
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

  onFormSubmit(model: any) {
    if (this.form.valid) {
      console.log(model);
      setTimeout(() => {
        this.savedEvent.emit();
      }, 1000);
    } else {
      this.errorEvent.emit();
    }
  }

  onSave(): void {
    this.editForm.onSubmit(new Event('submit'));
  }

  onCancel(): void {
    this.options.resetModel?.();
  }
}

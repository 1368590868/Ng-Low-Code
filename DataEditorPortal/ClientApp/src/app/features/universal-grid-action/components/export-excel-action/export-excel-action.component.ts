import { Component, ViewChild } from '@angular/core';
import { FormGroup, NgForm } from '@angular/forms';
import { FormlyFormOptions, FormlyFieldConfig } from '@ngx-formly/core';
import { NotifyService } from 'src/app/core/utils/notify.service';
import { GridActionDirective } from '../../directives/grid-action.directive';
import { ExportActionService } from '../../services/export-services/export-action.service';
import { ExportForm } from '../../models/export';

@Component({
  selector: 'app-export-excel-action',
  templateUrl: './export-excel-action.component.html',
  styleUrls: ['./export-excel-action.component.scss']
})
export class ExportExcelActionComponent extends GridActionDirective {
  @ViewChild('exportForm') exportForm!: NgForm;

  form = new FormGroup({});
  model: any = {};
  options: FormlyFormOptions = {};
  fields: FormlyFieldConfig[] = [
    {
      key: 'fileName',
      type: 'input',
      props: {
        label: 'File Name',
        placeholder: 'File Name',
        description: 'Description',
        required: true
      }
    },
    {
      key: 'exportOption',
      type: 'radio',
      defaultValue: 'Selection',
      props: {
        label: 'Export Option',
        description: 'Description',
        required: true,

        options: [
          { value: 'Selection', label: 'Export Selected Items Only' },
          { value: 'All', label: 'Export Entire Result' }
        ]
      }
    }
  ];

  constructor(
    private exportActionService: ExportActionService,
    private notifyService: NotifyService
  ) {
    super();
  }

  onFormSubmit(model: ExportForm) {
    if (this.form.valid) {
      this.exportActionService.exportFile(model).subscribe(res => {
        if (!res.isError && res.result) {
          this.notifyService.notifySuccess('Success', 'Export Success');
          this.savedEvent.emit();
        } else {
          this.errorEvent.emit();
        }
      });
    } else {
      this.errorEvent.emit();
    }
  }

  onSave(): void {
    this.exportForm.onSubmit(new Event('submit'));
  }

  onCancel(): void {
    this.options.resetModel?.();
  }
}

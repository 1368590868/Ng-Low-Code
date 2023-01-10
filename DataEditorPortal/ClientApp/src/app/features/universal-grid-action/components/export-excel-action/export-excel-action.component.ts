import { Component, ViewChild } from '@angular/core';
import { FormGroup, NgForm } from '@angular/forms';
import { FormlyFormOptions, FormlyFieldConfig } from '@ngx-formly/core';
import { GridActionDirective } from '../../directives/grid-action.directive';

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
      key: 'Input',
      type: 'input',
      props: {
        label: 'File Name',
        placeholder: 'File Name',
        description: 'Description',
        required: true
      }
    },
    {
      key: 'Radio',
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
    this.exportForm.onSubmit(new Event('submit'));
  }

  onCancel(): void {
    this.options.resetModel?.();
  }
}

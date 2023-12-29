import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, NgForm } from '@angular/forms';
import { FormlyFieldConfig, FormlyFormOptions } from '@ngx-formly/core';
import { EMPTY, catchError, tap } from 'rxjs';
import { SystemLogService } from 'src/app/shared';
import { GridActionDirective } from '../../directives/grid-action.directive';
import { ExportForm, ExportParam } from '../../models/export';
import { UniversalGridService } from '../../services/universal-grid.service';

@Component({
  selector: 'app-export-excel-action',
  templateUrl: './export-excel-action.component.html',
  styleUrls: ['./export-excel-action.component.scss']
})
export class ExportExcelActionComponent extends GridActionDirective implements OnInit {
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
        required: true
      }
    }
  ];

  constructor(private gridService: UniversalGridService, private systemLogService: SystemLogService) {
    super();
  }

  ngOnInit(): void {
    if (this.selectedRecords && this.selectedRecords.length > 0) {
      this.fields.push({
        key: 'exportOption',
        type: 'radio',
        defaultValue: 'Selection',
        props: {
          label: 'Export Option',
          required: true,

          options: [
            { value: 'Selection', label: 'Export Selected Items Only' },
            { value: 'All', label: 'Export Entire Result' }
          ]
        }
      });
    }

    this.model = {
      ...this.model,
      fileName: `Export-${this.gridName}-${new Date().toLocaleDateString('en-US')}`
    };

    this.loadedEvent.emit();
  }

  onFormSubmit(model: ExportForm) {
    if (this.form.valid) {
      const param = (this.fetchDataParam || {}) as ExportParam;
      param.fileName = model.fileName;
      if (model.exportOption === 'Selection') {
        const selectedIds = this.selectedRecords.map((x: any) => {
          return x[this.recordKey];
        });
        param.filters.push({
          field: this.recordKey,
          matchMode: 'in',
          value: selectedIds
        });
      }

      this.systemLogService.addSiteVisitLog({
        action: 'Export Data',
        section: this.gridName,
        params: JSON.stringify(param)
      });

      this.gridService
        .exportGridData(this.gridName, param)
        .pipe(
          catchError(() => {
            this.errorEvent.emit();
            return EMPTY;
          }),
          tap(result => {
            const url = window.URL.createObjectURL(result);
            const a = document.createElement('a');
            a.href = url;
            const fileName = param.fileName + '.xlsx';
            a.download = fileName;
            a.click();
            a.remove();
            this.cancelEvent.emit();
          })
        )
        .subscribe();
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

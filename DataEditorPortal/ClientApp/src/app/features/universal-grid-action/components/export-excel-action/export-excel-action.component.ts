import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, NgForm } from '@angular/forms';
import { FormlyFormOptions, FormlyFieldConfig } from '@ngx-formly/core';
import { catchError, EMPTY, tap } from 'rxjs';
import { NotifyService } from 'src/app/core/utils/notify.service';
import {
  GridActionDirective,
  OnGridActionDialogShow
} from '../../directives/grid-action.directive';
import { ExportForm, ExportParam } from '../../models/export';
import { UniversalGridService } from '../../services/universal-grid.service';

@Component({
  selector: 'app-export-excel-action',
  templateUrl: './export-excel-action.component.html',
  styleUrls: ['./export-excel-action.component.scss']
})
export class ExportExcelActionComponent
  extends GridActionDirective
  implements OnGridActionDialogShow, OnInit
{
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
    }
  ];

  constructor(
    private gridService: UniversalGridService,
    private notifyService: NotifyService
  ) {
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
          description: 'Description',
          required: true,

          options: [
            { value: 'Selection', label: 'Export Selected Items Only' },
            { value: 'All', label: 'Export Entire Result' }
          ]
        }
      });
    }
  }

  onDialogShow() {
    this.model = {
      ...this.model,
      fileName: `Export-${
        this.gridService.currentPortalItem
      }-${new Date().toLocaleDateString('en-US')}`
    };
    this.loadedEvent.emit();
  }

  onFormSubmit(model: ExportForm) {
    if (this.form.valid) {
      const param = this.fetchDataParam as ExportParam;
      param.fileName = model.fileName;
      if (model.exportOption === 'Selection') {
        const selectedIds: string[] = this.selectedRecords.map((x: any) => {
          return (x[this.recordKey] as string).replace("'", '');
        });
        param.filters.push({
          field: this.recordKey,
          matchMode: 'in',
          value: `'${selectedIds.join(`','`)}'`
        });
      }

      this.gridService
        .exportGridData(param)
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
            this.savedEvent.emit();
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

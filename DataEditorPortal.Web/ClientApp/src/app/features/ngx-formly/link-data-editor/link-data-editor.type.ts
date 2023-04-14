import { Component, ChangeDetectionStrategy } from '@angular/core';
import { FieldType, FieldTypeConfig } from '@ngx-formly/core';
import { FormlyFieldProps } from '@ngx-formly/primeng/form-field';

export interface ColumnsConfig {
  type: string;
  field: string;
  header: string;
  width: string;
  filterType: string;
  sortable: boolean;
  template: null;
  format: null;
}

export interface TableConfig {
  columns: ColumnsConfig[];
  dataKey: string;
}

interface LinkDataEditorProps extends FormlyFieldProps {
  table1Name?: string;
  searchParams?: any;
  table1Id?: string;
}

@Component({
  selector: 'app-formly-field-link-data-editor',
  template: `<app-link-data-table
    [searchParams]="props.searchParams || {}"
    [table1Name]="props.table1Name || ''"
    [formControl]="formControl"
    [formlyAttributes]="field"
    [table1Id]="props.table1Id"></app-link-data-table> `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [
    `
      :host {
        width: 100% !important;
        margin-top: 0.25rem;
      }
    `
  ]
})
export class FormlyFieldLinkDataEditorComponent extends FieldType<
  FieldTypeConfig<LinkDataEditorProps>
> {}

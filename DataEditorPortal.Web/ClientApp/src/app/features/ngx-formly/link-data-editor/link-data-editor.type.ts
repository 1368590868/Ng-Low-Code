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
  table2IdColumn: string;
  table2Name: string;
  table1IsPrimary?: boolean;
  isOneToMany?: boolean;
}

interface LinkDataEditorProps extends FormlyFieldProps {
  table1Name?: string;
  searchParams?: any;
}

@Component({
  selector: 'app-formly-field-link-data-editor',
  template: `<app-link-data-table
    [searchParams]="props.searchParams || {}"
    [table1Name]="props.table1Name || ''"
    [formControl]="formControl"
    [formlyAttributes]="field"></app-link-data-table> `,
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
export class FormlyFieldLinkDataEditorComponent extends FieldType<FieldTypeConfig<LinkDataEditorProps>> {}

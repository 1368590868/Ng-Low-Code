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
  tableName?: string;
  searchParams?: any;
  columnsConfig: ColumnsConfig[];
  dataSource: any[];
  table1Id?: string;
}

@Component({
  selector: 'app-formly-field-link-data-editor',
  template: `<app-link-data-table
    [searchParams]="props.searchParams || {}"
    [tableName]="props.tableName || ''"
    [formControl]="formControl"
    [formlyAttributes]="field"
    [table1Id]="props.table1Id"></app-link-data-table> `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FormlyFieldLinkDataEditorComponent extends FieldType<
  FieldTypeConfig<LinkDataEditorProps>
> {}

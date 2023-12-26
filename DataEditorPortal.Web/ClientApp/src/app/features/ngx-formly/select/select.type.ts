import { ChangeDetectionStrategy, Component, Type } from '@angular/core';
import { FieldType, FieldTypeConfig, FormlyFieldConfig } from '@ngx-formly/core';
import { FormlyFieldSelectProps } from '@ngx-formly/core/select';
import { FormlyFieldProps } from '@ngx-formly/primeng/form-field';

interface SelectProps extends FormlyFieldProps, FormlyFieldSelectProps {
  appendTo?: string;
  autoDisplayFirst: boolean;
  virtualScrollItemSize?: number;
  onShow?: () => void;
  emptyMessage: string;
  showClear?: boolean;
  editable?: boolean;
  loading?: boolean;
}

export interface FormlySelectFieldConfig extends FormlyFieldConfig<SelectProps> {
  type: 'select' | Type<FormlyFieldSelectComponent>;
}

@Component({
  selector: 'app-formly-field-primeng-select',
  template: `
    <p-dropdown
      #dropdown
      [placeholder]="props.placeholder || ''"
      [options]="(props.options | formlySelectOptions : field | async) || []"
      [formControl]="formControl"
      [formlyAttributes]="field"
      [showClear]="props.showClear !== undefined ? props.showClear : !props.required"
      (onChange)="props.change && props.change(field, $event)"
      [appendTo]="props.appendTo || 'body'"
      [autoDisplayFirst]="!!props.autoDisplayFirst"
      [editable]="props.editable !== undefined ? props.editable : false"
      (onShow)="props.onShow && props.onShow()"
      [panelStyleClass]="props.loading ? 'p-dropdown-loading' : ''"
      [emptyMessage]="props.emptyMessage">
      <ng-template pTemplate="dropdownicon">
        <i *ngIf="props.loading" class="pi pi-spin pi-spinner"></i>
        <i *ngIf="!props.loading" class="pi pi-angle-down"></i>
      </ng-template>
      <ng-template let-item pTemplate="item">
        <span *ngIf="!props.loading">{{ item.label ?? 'empty' }}</span>
        <span *ngIf="props.loading"><p-skeleton></p-skeleton></span>
      </ng-template>
    </p-dropdown>
  `,
  styles: [
    `
      ::ng-deep {
        .p-dropdown-loading.p-dropdown-panel {
          .p-dropdown-items {
            &::before {
              content: ' ';
              position: absolute;
              width: 100%;
              height: 100%;
              z-index: 10;
            }
          }
        }
      }
    `
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FormlyFieldSelectComponent extends FieldType<FieldTypeConfig<SelectProps>> {}

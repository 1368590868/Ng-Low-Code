import { Component, ChangeDetectionStrategy, Type } from '@angular/core';
import {
  FieldType,
  FieldTypeConfig,
  FormlyFieldConfig
} from '@ngx-formly/core';
import { FormlyFieldProps } from '@ngx-formly/primeng/form-field';

interface DatepickerProps extends FormlyFieldProps {
  defaultDate: Date;
  dateFormat: string;
  hourFormat: string;
  showTime: boolean;
  showIcon: boolean;
  showButtonBar: boolean;
  showOtherMonths: boolean;
  selectOtherMonths: boolean;
  selectionMode?: string;
  numberOfMonths: number;
  inline: boolean;
  readonlyInput: boolean;
  touchUI: boolean;
  monthNavigator: boolean;
  yearNavigator: boolean;
  yearRange: string;
}

export interface FormlyDatepickerFieldConfig
  extends FormlyFieldConfig<DatepickerProps> {
  type: 'datepicker' | Type<FormlyFieldDatepickerComponent>;
}

@Component({
  selector: 'app-formly-field-primeng-datepicker',
  template: `
    <p-calendar
      [defaultDate]="props.defaultDate"
      [dateFormat]="props.dateFormat"
      [hourFormat]="props.hourFormat"
      [showTime]="props.showTime"
      [showIcon]="isNotSet(props.showIcon) ? true : props.showIcon"
      [showButtonBar]="
        isNotSet(props.showButtonBar) ? true : props.showButtonBar
      "
      [showOtherMonths]="
        isNotSet(props.showOtherMonths) ? true : props.showOtherMonths
      "
      [selectOtherMonths]="props.selectOtherMonths"
      [selectionMode]="props.selectionMode || 'single'"
      [numberOfMonths]="props.numberOfMonths || 1"
      [inline]="props.inline"
      [readonlyInput]="props.readonlyInput"
      [touchUI]="props.touchUI"
      [monthNavigator]="props.monthNavigator"
      [yearNavigator]="props.yearNavigator"
      [yearRange]="props.yearRange || '2020:2030'"
      [placeholder]="props.placeholder || ''"
      [formControl]="formControl"
      [formlyAttributes]="field"
      appendTo="body">
    </p-calendar>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FormlyFieldDatepickerComponent extends FieldType<
  FieldTypeConfig<DatepickerProps>
> {
  isNotSet(val: unknown) {
    return val === null || val === undefined;
  }
}

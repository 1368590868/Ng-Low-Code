import { Type } from '@angular/core';
import { GridActionDirective } from '../directives/grid-action.directive';

export interface GridActionWrapperOption {
  label?: string;
  icon?: string;
  header?: string;
  okText?: string;
  cancelText?: string;
  class?: string;
  buttonStyleClass?: string;
  dialogStyle?: object;
  dialogContentStyleClass?: string;
  dialogHideFooter?: boolean;
  dialogModal?: boolean;
}

export interface GridActionOption {
  name: string;
  wrapper?: GridActionWrapperOption;
  props?: {
    [propName: string]: any;
  };
}

export interface GridActionConfig {
  name: string;
  label?: string;
  isCustom?: boolean;
  requireGridRowSelected?: boolean | number | string;
  component: Type<GridActionDirective>;
  wrapper?: GridActionWrapperOption;
  props?: {
    [propName: string]: any;
  };
}

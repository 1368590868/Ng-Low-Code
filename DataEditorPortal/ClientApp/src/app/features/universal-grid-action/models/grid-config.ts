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
  requireGridRowSelected: boolean;
  component: Type<GridActionDirective>;
  data: any;
}

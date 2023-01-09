import { Type } from '@angular/core';
import { GridActionDirective } from '../directives/grid-action.directive';

export interface GridConfig {
  name: string;
  caption: string;
  actions: GridActionConfig[];
}

export interface GridActionConfig {
  name: string;
  component: Type<GridActionDirective>;
  data: any;
}

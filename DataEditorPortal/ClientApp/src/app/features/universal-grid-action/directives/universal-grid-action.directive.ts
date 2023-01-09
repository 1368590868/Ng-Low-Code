import {
  ComponentRef,
  Directive,
  DoCheck,
  Inject,
  Input,
  ViewContainerRef
} from '@angular/core';
import { GridActionDirective } from './grid-action.directive';
import { GridActionConfig } from '../models/grid-config';

@Directive({
  selector: '[appUniversalGridAction]'
})
export class UniversalGridActionDirective implements DoCheck {
  @Input() actions: string[] = [];

  actionLoaded = false;
  actionRefs: ComponentRef<GridActionDirective>[] = [];
  constructor(
    private viewContainerRef: ViewContainerRef,
    @Inject('GRID_ACTION_CONFIG') private config: GridActionConfig[]
  ) {}

  ngDoCheck(): void {
    if (!this.actionLoaded) {
      this.renderGridActions();
    }
  }

  renderGridActions() {
    if (
      !this.actionLoaded &&
      this.actions &&
      this.actions.length > 0 &&
      this.viewContainerRef
    ) {
      this.viewContainerRef.clear();

      this.actions.forEach(x => {
        const actionCfg = this.config.find(action => {
          return action.name === x;
        });

        if (actionCfg) {
          const actionRef =
            this.viewContainerRef.createComponent<GridActionDirective>(
              actionCfg.component
            );
          this.actionRefs.push(actionRef);
        }
      });

      this.actionLoaded = true;
    }
  }
}

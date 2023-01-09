import {
  ComponentRef,
  Directive,
  DoCheck,
  EventEmitter,
  Inject,
  Input,
  Output,
  ViewContainerRef
} from '@angular/core';
import { GridActionDirective } from './grid-action.directive';
import { GridActionConfig } from '../models/grid-config';
import { ActionWrapperComponent } from '../components/action-wrapper/action-wrapper.component';

@Directive({
  selector: '[appUniversalGridAction]'
})
export class UniversalGridActionDirective implements DoCheck {
  @Input() actions: string[] = [];

  @Output() savedEvent = new EventEmitter<void>();

  actionLoaded = false;

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
          const wrapperRef =
            this.viewContainerRef.createComponent<ActionWrapperComponent>(
              ActionWrapperComponent
            );

          // assign wrapper data;
          wrapperRef.instance.label = 'Edit';

          const actionRef =
            wrapperRef.instance.viewContainerRef.createComponent<GridActionDirective>(
              actionCfg.component
            );

          // bind action events
          actionRef.instance.savedEvent.asObservable().subscribe(() => {
            wrapperRef.instance.visible = false;
            this.savedEvent.emit();
          });
          actionRef.instance.errorEvent.asObservable().subscribe(() => {
            wrapperRef.instance.isLoading = false;
          });

          // set actionRef to wrapper, for it to invoke
          wrapperRef.instance.componentRef = actionRef;
        }
      });

      this.actionLoaded = true;
    }
  }
}

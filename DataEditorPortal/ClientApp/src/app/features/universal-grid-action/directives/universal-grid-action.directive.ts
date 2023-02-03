import {
  ComponentRef,
  Directive,
  DoCheck,
  EventEmitter,
  Inject,
  Input,
  OnChanges,
  OnDestroy,
  Output,
  SimpleChanges,
  ViewContainerRef
} from '@angular/core';
import { GridActionDirective } from './grid-action.directive';
import { GridActionConfig, GridActionOption } from '../models/grid-config';
import { ActionWrapperComponent } from '../components/action-wrapper/action-wrapper.component';
import { ActivatedRoute } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { UniversalGridService } from '../services/universal-grid.service';

@Directive({
  selector: '[appUniversalGridAction]'
})
export class UniversalGridActionDirective
  implements DoCheck, OnChanges, OnDestroy
{
  @Input() actions: GridActionOption[] = [];
  @Input() selectedRecords: any[] = [];
  @Input() recordKey = 'Id';
  @Input() fetchDataParam: any;

  @Output() savedEvent = new EventEmitter<void>();

  actionLoaded = false;
  actionWrapperRefs: ComponentRef<ActionWrapperComponent>[] = [];
  destroy$ = new Subject();

  constructor(
    private route: ActivatedRoute,
    private viewContainerRef: ViewContainerRef,
    private gridService: UniversalGridService,
    @Inject('GRID_ACTION_CONFIG') private config: GridActionConfig[]
  ) {
    // subscribe route change to update currentPortalItem
    this.route.params.pipe(takeUntil(this.destroy$)).subscribe((param: any) => {
      if (param && param.name) {
        this.gridService.currentPortalItem = param.name;
      }
    });
  }

  ngOnDestroy() {
    this.destroy$.next(null);
    this.destroy$.complete();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if ('selectedRecords' in changes) {
      // selectedRecords changed, reloaded actions.
      this.actionLoaded = false;
    }
    if ('fetchDataParam' in changes) {
      this.actionWrapperRefs.forEach(wrapper => {
        wrapper.instance.fetchDataParam = this.fetchDataParam;
      });
    }
  }

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
      this.actionWrapperRefs = [];

      this.actions.forEach(x => {
        const actionCfg = this.config.find(action => {
          return action.name === x.name;
        });

        if (
          actionCfg &&
          ((actionCfg.requireGridRowSelected === true &&
            this.selectedRecords.length > 0) ||
            actionCfg.requireGridRowSelected === this.selectedRecords.length ||
            actionCfg.requireGridRowSelected === undefined ||
            actionCfg.requireGridRowSelected === false)
        ) {
          const wrapperRef =
            this.viewContainerRef.createComponent<ActionWrapperComponent>(
              ActionWrapperComponent
            );

          const tableParams = {
            selectedRecords: this.selectedRecords,
            recordKey: this.recordKey,
            fetchDataParam: this.fetchDataParam
          };
          // assign wrapper config;
          const wrapperProps = {};
          if (actionCfg.wrapper) Object.assign(wrapperProps, actionCfg.wrapper);
          if (x.wrapper) Object.assign(wrapperProps, x.wrapper);
          Object.assign(wrapperProps, tableParams);
          if (wrapperRef instanceof ComponentRef) {
            Object.assign(wrapperRef.instance, wrapperProps);
          }

          // assign action config;
          const config = { ...actionCfg };
          if (!config.props) config.props = {};
          if (x.props) Object.assign(config.props, x.props);
          Object.assign(config.props, tableParams);
          wrapperRef.instance.actionConfig = config;

          wrapperRef.instance.savedEvent.subscribe(() => {
            this.savedEvent.emit();
          });
          this.actionWrapperRefs.push(wrapperRef);
        }
      });

      this.actionLoaded = true;
    }
  }
}

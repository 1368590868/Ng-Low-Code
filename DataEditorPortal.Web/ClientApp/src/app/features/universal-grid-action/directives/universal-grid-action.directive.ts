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
  @Input() gridName!: string;
  @Input() selectedRecords: any[] = [];
  @Input() recordKey!: string;
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
  ) {}

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
        if (wrapper.instance.actionConfig.props)
          wrapper.instance.actionConfig.props['fetchDataParam'] =
            this.fetchDataParam;
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

          // create a copy of actionCfg
          const config = JSON.parse(
            JSON.stringify(actionCfg)
          ) as GridActionConfig;
          config.component = actionCfg.component;

          // assign wrapper config;
          const wrapperProps = {};
          if (config.wrapper) Object.assign(wrapperProps, config.wrapper);
          if (x.wrapper) Object.assign(wrapperProps, x.wrapper);
          if (wrapperRef instanceof ComponentRef) {
            Object.assign(wrapperRef.instance, wrapperProps);
          }

          // assign action config;
          if (!config.props) config.props = {};
          if (x.props) Object.assign(config.props, x.props);
          const tableParams = {
            gridName: this.gridName,
            selectedRecords: this.selectedRecords,
            recordKey: this.recordKey,
            fetchDataParam: this.fetchDataParam
          };
          Object.assign(config.props, tableParams);
          wrapperRef.instance.actionConfig = config;

          wrapperRef.instance.savedEvent
            .pipe(takeUntil(this.destroy$))
            .subscribe(() => {
              this.savedEvent.emit();
            });
          this.actionWrapperRefs.push(wrapperRef);
        }
      });

      this.actionLoaded = true;
    }
  }
}

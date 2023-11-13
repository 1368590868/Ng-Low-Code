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
      this.actionWrapperRefs.forEach(wrapper => {
        this.syncActionProps(wrapper, 'selectedRecords');
        this.setActionWrapperVisible(wrapper);
      });
    }
    if ('fetchDataParam' in changes) {
      this.actionWrapperRefs.forEach(wrapper => {
        this.syncActionProps(wrapper, 'fetchDataParam');
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

        if (actionCfg) {
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

          this.setActionWrapperVisible(wrapperRef);
          this.actionWrapperRefs.push(wrapperRef);
        }
      });

      this.actionLoaded = true;
    }
  }

  setActionWrapperVisible(wrapper: ComponentRef<ActionWrapperComponent>) {
    const actionCfg = wrapper.instance.actionConfig;

    const isActionVisible = (): boolean => {
      if (typeof actionCfg.requireGridRowSelected === 'string') {
        const operator = actionCfg.requireGridRowSelected.split(' ')[0];
        const value = actionCfg.requireGridRowSelected.split(' ')[1];
        if (operator === '>') {
          return this.selectedRecords.length > Number(value);
        } else if (operator === '<') {
          return this.selectedRecords.length < Number(value);
        } else if (operator === '=') {
          return this.selectedRecords.length === Number(value);
        } else {
          return false;
        }
      } else {
        return (
          (actionCfg.requireGridRowSelected === true &&
            this.selectedRecords.length > 0) ||
          actionCfg.requireGridRowSelected === this.selectedRecords.length ||
          actionCfg.requireGridRowSelected === undefined ||
          actionCfg.requireGridRowSelected === false
        );
      }
    };

    wrapper.instance.visible = isActionVisible();
  }

  syncActionProps(wrapper: ComponentRef<ActionWrapperComponent>, prop: string) {
    if (wrapper.instance.actionConfig.props)
      wrapper.instance.actionConfig.props[prop] = (this as any)[prop];
  }
}

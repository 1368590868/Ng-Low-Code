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

  @Output() savedEvent = new EventEmitter<void>();

  actionLoaded = false;
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

      this.actions.forEach(x => {
        const actionCfg = this.config.find(action => {
          return action.name === x.name;
        });

        if (
          actionCfg &&
          (!actionCfg.requireGridRowSelected || this.selectedRecords.length > 0)
        ) {
          const wrapperRef =
            this.viewContainerRef.createComponent<ActionWrapperComponent>(
              ActionWrapperComponent
            );

          // assign wrapper config;
          if (actionCfg.wrapper) {
            if (wrapperRef instanceof ComponentRef) {
              Object.assign(wrapperRef.instance, actionCfg.wrapper);
            }
          }

          // assign wrapper data;
          if (x.wrapper) {
            if (wrapperRef instanceof ComponentRef) {
              Object.assign(wrapperRef.instance, x.wrapper);
            }
          }

          const actionRef =
            wrapperRef.instance.viewContainerRef.createComponent<GridActionDirective>(
              actionCfg.component
            );

          // assign action data;
          if (x.props) {
            if (actionRef instanceof ComponentRef) {
              Object.assign(actionRef.instance, x.props);
            }
          }
          actionRef.instance.selectedRecords = this.selectedRecords;
          actionRef.instance.recordKey = this.recordKey;

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

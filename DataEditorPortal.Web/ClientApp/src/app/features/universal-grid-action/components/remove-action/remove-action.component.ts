import { Component, Inject, Injector, OnInit, Type } from '@angular/core';
import { tap } from 'rxjs';
import { NotifyService, SystemLogService } from 'src/app/shared';
import { GridActionDirective } from '../../directives/grid-action.directive';
import { FormEventConfig, FormEventMeta } from '../../models/edit';
import { EventActionHandlerService, AsyncQueryTextActionHandler } from '../../services/event-action-handler.service';
import { UniversalGridService } from '../../services/universal-grid.service';
import * as qs from 'qs';

@Component({
  selector: 'app-remove-action',
  templateUrl: './remove-action.component.html',
  styleUrls: ['./remove-action.component.scss']
})
export class RemoveActionComponent extends GridActionDirective implements OnInit {
  eventConfig?: FormEventConfig;
  constructor(
    private gridService: UniversalGridService,
    private notifyService: NotifyService,
    private systemLogService: SystemLogService,
    private injector: Injector,
    @Inject('EVENT_ACTION_CONFIG')
    private EVENT_ACTION_CONFIG: {
      name: string;
      handler: Type<EventActionHandlerService>;
    }[]
  ) {
    super();
  }
  ngOnInit(): void {
    this.getEventConfig();
    this.loadedEvent.emit();
  }

  onUrlParamsChange() {
    const urlParams = qs.parse(window.location.search, {
      ignoreQueryPrefix: true
    });

    if (Object.keys(urlParams).length > 0) {
      const action = Object.keys(urlParams);
      action.forEach(key => {
        if (key === 'delete') {
          this.deleteGridData();
        }
      });
    }
  }
  getEventConfig() {
    this.gridService
      .getEventConfig(this.gridName, 'DELETE')
      .pipe(
        tap((result: FormEventConfig) => {
          this.eventConfig = result;
        })
      )
      .subscribe();
  }

  getEventActionHandler(eventConfig?: FormEventMeta) {
    if (eventConfig && eventConfig.eventType === 'Javascript') {
      const action = this.EVENT_ACTION_CONFIG.find(x => x.name === eventConfig.script);
      if (action) return this.injector.get(action?.handler);
    }
    if (
      (eventConfig && eventConfig.eventType === 'QueryText') ||
      (eventConfig && eventConfig.eventType === 'QueryStoredProcedure')
    ) {
      return this.injector.get(AsyncQueryTextActionHandler);
    }
    return null;
  }

  deleteGridData() {
    this.systemLogService.addSiteVisitLog({
      action: 'Remove',
      section: this.gridName,
      params: JSON.stringify(this.selectedRecords)
    });
    this.gridService
      .deleteGridData(
        this.gridName,
        this.selectedRecords.map((x: any) => x[this.recordKey])
      )
      .subscribe(res => {
        if (res.code === 200 && res.data) {
          this.notifyService.notifySuccess('Success', 'Remove Successfully Completed.');
          // run after saved event if configured.
          const handler = this.getEventActionHandler(this.eventConfig?.afterSaved);
          if (handler) handler.excuteAction().subscribe();
          this.savedEvent.emit();
        } else {
          this.errorEvent.emit();
        }
      });
  }

  onSave(): void {
    const handler = this.getEventActionHandler(this.eventConfig?.onValidate);
    if (handler) {
      handler
        .excuteAction({
          name: this.gridName,
          type: 'DELETE',
          id: this.selectedRecords[0][this.recordKey],
          errorMsg: 'Validation failed. Please check your data.'
        })
        .subscribe((res: boolean) => {
          if (res) this.deleteGridData();
          else this.errorEvent.emit();
        });
    } else {
      this.deleteGridData();
    }
  }
}

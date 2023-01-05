import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { trigger, style, animate, transition } from '@angular/animations';
import { ActivatedRoute } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { GridTableService } from '../../services/grid-table.service';

@Component({
  selector: 'app-split-area',
  templateUrl: './split-area.component.html',
  styleUrls: ['./split-area.component.scss'],
  animations: [
    trigger('fadeInOut', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('200ms 300ms', style({ opacity: 1 }))
      ]),
      transition(':leave', [animate('100ms', style({ opacity: 0 }))])
    ])
  ]
})
export class SplitAreaComponent implements OnInit, OnDestroy {
  @ViewChild('splitter') splitterRef: any;

  showPanel = true;
  panelSizesPrev = [20, 80];
  stateKey = 'universial-grid-splitter';
  stateStorage = 'session';

  destroy$ = new Subject();

  constructor(
    private route: ActivatedRoute,
    private gridTableService: GridTableService
  ) {}

  ngOnInit() {
    const storage = this.getStorage();
    const statePrevString = storage.getItem(`${this.stateKey}-prev`);
    if (statePrevString) {
      this.panelSizesPrev = JSON.parse(statePrevString);
    }

    const stateString = storage.getItem(this.stateKey);
    if (stateString) {
      const panelSizes = JSON.parse(stateString);
      if (panelSizes[0] === 0) {
        this.showPanel = false;
      }
    }

    // subscribe route change to update currentPortalItem
    this.route.params.pipe(takeUntil(this.destroy$)).subscribe((param: any) => {
      if (param && param.name) {
        this.gridTableService.currentPortalItem = param.name;
      }
    });
  }

  ngOnDestroy() {
    this.destroy$.next(null);
    this.destroy$.complete();
  }

  onToggle() {
    if (this.showPanel) {
      this.panelSizesPrev = this.splitterRef._panelSizes;
      this.getStorage().setItem(
        `${this.stateKey}-prev`,
        JSON.stringify(this.panelSizesPrev)
      );
      this.splitterRef._panelSizes = [0, 100];
      this.showPanel = false;
    } else {
      this.splitterRef._panelSizes = this.panelSizesPrev;
      this.showPanel = true;
    }
    this.splitterRef.saveState();
    this.splitterRef.restoreState();
  }

  getStorage() {
    switch (this.stateStorage) {
      case 'local':
        return window.localStorage;
      case 'session':
        return window.sessionStorage;
      default:
        throw new Error(
          this.stateStorage +
            ' is not a valid value for the state storage, supported values are "local" and "session".'
        );
    }
  }
}

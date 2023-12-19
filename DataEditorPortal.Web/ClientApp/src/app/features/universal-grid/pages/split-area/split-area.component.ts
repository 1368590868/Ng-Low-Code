import { ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { trigger, style, animate, transition, state } from '@angular/animations';
import { ActivatedRoute } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { ConfigDataService } from 'src/app/shared';

@Component({
  selector: 'app-split-area',
  templateUrl: './split-area.component.html',
  styleUrls: ['./split-area.component.scss'],
  animations: [
    trigger('fadeInOut', [
      transition(':enter', [style({ opacity: 0 }), animate('200ms 100ms', style({ opacity: 1 }))]),
      transition(':leave', [animate('100ms', style({ opacity: 0 }))])
    ]),
    trigger('fadeInOutButton', [
      state('hide', style({ opacity: 1 })),
      state('show', style({ opacity: 1 })),
      transition('show => hide', [
        style({ opacity: 0, transform: 'rotate(180deg) translateX(50px)' }),
        animate('200ms 300ms', style({ opacity: 1, transform: 'rotate(180deg)' }))
      ]),
      transition('hide => show', [style({ opacity: 0 }), animate('200ms 100ms', style({ opacity: 1 }))])
    ])
  ]
})
export class SplitAreaComponent implements OnInit, OnDestroy {
  @ViewChild('splitter') splitterRef: any;
  panelSizesPrev = [20, 80];
  stateKey = 'universal-grid-splitter';
  stateStorage = 'session';

  destroy$ = new Subject();
  itemType = '';
  gridName = '';

  constructor(
    private route: ActivatedRoute,
    private changeDetectorRef: ChangeDetectorRef,
    public configDataService: ConfigDataService
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
        this.configDataService.sidebarCollapsed = true;
      }
    }

    // get item type from route
    this.route.data.pipe(takeUntil(this.destroy$)).subscribe(data => {
      this.itemType = data['type'];

      this.gridName = '';
      this.changeDetectorRef.detectChanges();
      this.gridName = data['name'];
      this.changeDetectorRef.detectChanges();
    });
  }

  ngOnDestroy() {
    this.destroy$.next(null);
    this.destroy$.complete();
  }

  onToggle() {
    if (!this.configDataService.sidebarCollapsed) {
      this.panelSizesPrev = this.splitterRef._panelSizes;
      this.getStorage().setItem(`${this.stateKey}-prev`, JSON.stringify(this.panelSizesPrev));
      this.splitterRef._panelSizes = [0, 100];
      this.configDataService.sidebarCollapsed = true;
    } else {
      this.splitterRef._panelSizes = this.panelSizesPrev;
      this.configDataService.sidebarCollapsed = false;
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
          this.stateStorage + ' is not a valid value for the state storage, supported values are "local" and "session".'
        );
    }
  }

  onResizeEnd({ sizes }: { sizes: number[] }) {
    if (sizes[0] < 15) {
      this.splitterRef._panelSizes = [15, 85];
    }
    this.configDataService.sidebarCollapsed = false;
    this.splitterRef.saveState();
    this.splitterRef.restoreState();
  }
}

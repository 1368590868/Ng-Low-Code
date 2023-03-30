import {
  Component,
  Directive,
  EventEmitter,
  OnDestroy,
  OnInit,
  Output
} from '@angular/core';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { switchMap, of, Subject, takeUntil } from 'rxjs';
import { NotifyService } from 'src/app/shared';
import { PortalItemService } from '../../services/portal-item.service';

@Directive({
  selector: '[appPortalEditStep]'
})
export class PortalEditStepDirective {
  @Output() saveNextEvent = new EventEmitter();
  @Output() saveDraftEvent = new EventEmitter();
  @Output() backEvent = new EventEmitter();
}

@Component({
  selector: 'app-portal-edit',
  templateUrl: './portal-edit.component.html',
  styleUrls: ['./portal-edit.component.scss']
})
export class PortalEditComponent implements OnInit, OnDestroy {
  items!: MenuItem[];

  activatedIndex = 0;
  destroy$ = new Subject();

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    public portalItemService: PortalItemService,
    private notifyService: NotifyService
  ) {}

  ngOnInit() {
    this.activatedRoute.paramMap
      .pipe(
        takeUntil(this.destroy$),
        switchMap((params: ParamMap) => {
          return of(params.get('id') || '');
        })
      )
      .subscribe(val => {
        this.portalItemService.currentPortalItemId = val;
        if (this.portalItemService.currentPortalItemId) {
          this.portalItemService.getPortalDetails().subscribe(res => {
            this.portalItemService.currentPortalItemConfigCompleted =
              res['configCompleted'];
            this.portalItemService.currentPortalItemCaption = res['label'];
            const next = res['currentStep'] || 'basic';
            this.activatedIndex = this.items.findIndex(
              x => x.routerLink === next
            );
            this.router.navigate([next], {
              relativeTo: this.activatedRoute,
              replaceUrl: true
            });
          });
        } else {
          this.portalItemService.currentPortalItemConfigCompleted = false;
          this.portalItemService.currentPortalItemCaption = undefined;
          this.activatedIndex = 0;
          this.router.navigate(['basic'], {
            relativeTo: this.activatedRoute,
            replaceUrl: true
          });
        }
      });

    this.items = [
      {
        label: 'Basic',
        routerLink: 'basic'
      },
      {
        label: 'Data Source',
        routerLink: 'datasource'
      },
      {
        label: 'Grid Columns',
        routerLink: 'columns'
      },
      {
        label: 'Search Configration',
        routerLink: 'search'
      },
      {
        label: 'Add / Edit / View',
        routerLink: 'form'
      }
    ];
  }

  onActivate(componentRef: any) {
    // set the activated index
    this.activatedIndex = this.items.findIndex(item => {
      const routerLink = Array.isArray(item.routerLink)
        ? item.routerLink
        : [item.routerLink];
      return this.router.isActive(
        this.router
          .createUrlTree(routerLink, { relativeTo: this.activatedRoute })
          .toString(),
        {
          paths: 'subset',
          queryParams: 'subset',
          fragment: 'ignored',
          matrixParams: 'ignored'
        }
      );
    });

    if (componentRef instanceof PortalEditStepDirective) {
      const child = componentRef as PortalEditStepDirective;
      // save and next
      child.saveNextEvent.pipe(takeUntil(this.destroy$)).subscribe(() => {
        let next = '';
        if (this.activatedIndex + 1 >= this.items.length) next = '../../list';
        else next = this.items[this.activatedIndex + 1].routerLink;
        this.router.navigate([next], {
          relativeTo: this.activatedRoute
        });
      });

      // save draft and exit
      child.saveDraftEvent.pipe(takeUntil(this.destroy$)).subscribe(() => {
        this.notifyService.notifySuccess(
          'Success',
          'Save Draft Successfully Completed.'
        );
        const next = this.portalItemService.currentPortalItemId
          ? '../../list'
          : '../list';
        this.router.navigate([next], {
          relativeTo: this.activatedRoute
        });
      });

      // back
      child.backEvent.pipe(takeUntil(this.destroy$)).subscribe(() => {
        let next = '';
        next = this.items[this.activatedIndex - 1].routerLink;
        this.router.navigate([next], {
          relativeTo: this.activatedRoute
        });
      });
    }
  }

  onDeactivate() {
    this.destroy$.next(null);
  }

  ngOnDestroy() {
    this.destroy$.next(null);
    this.destroy$.complete();
  }
}

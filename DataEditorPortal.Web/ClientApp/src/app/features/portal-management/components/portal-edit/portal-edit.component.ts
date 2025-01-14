import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Data, ParamMap, Router, Routes } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { Subject, of, switchMap, take, takeUntil, tap } from 'rxjs';
import { NotifyService } from 'src/app/shared';
import { PortalEditStepDirective } from '../../directives/portal-edit-step.directive';
import { PortalItemService } from '../../services/portal-item.service';

@Component({
  selector: 'app-portal-edit',
  templateUrl: './portal-edit.component.html',
  styleUrls: ['./portal-edit.component.scss']
})
export class PortalEditComponent implements OnInit, OnDestroy {
  steps!: MenuItem[];

  activatedIndex = -1;
  destroy$ = new Subject();

  set itemType(val: string | undefined) {
    this.portalItemService.itemType = val;
  }
  get itemType() {
    return this.portalItemService.itemType;
  }
  set itemId(val: string | undefined) {
    this.portalItemService.itemId = val;
  }
  get itemId() {
    return this.portalItemService.itemId;
  }
  set itemCaption(val: string | undefined) {
    this.portalItemService.itemCaption = val;
  }
  get itemCaption() {
    return this.portalItemService.itemCaption;
  }
  set configCompleted(val: boolean | undefined) {
    this.portalItemService.configCompleted = val;
  }
  get configCompleted() {
    return this.portalItemService.configCompleted;
  }
  set parentId(val: string | undefined) {
    this.portalItemService.parentFolder = val;
  }
  get parentId() {
    return this.portalItemService.parentFolder;
  }
  set dataSourceConnectionName(val: string | undefined) {
    this.portalItemService.dataSourceConnectionName = val;
  }
  get dataSourceConnectionName() {
    return this.portalItemService.dataSourceConnectionName;
  }

  get itemLink() {
    const fn = (routes: Routes | undefined) => {
      if (!routes) return undefined;
      let path: string | undefined;
      for (let i = 0; i < routes.length; i++) {
        if (routes[i].data?.['id'] === this.itemId) {
          path = routes[i].path;
          break;
        } else if (routes[i].children) {
          const temp = fn(routes[i].children);
          if (temp) {
            path = `${routes[i].path}/${temp}`;
            break;
          }
        }
      }
      return path;
    };
    return fn(this.router.config);
  }

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private portalItemService: PortalItemService,
    private notifyService: NotifyService
  ) {}

  ngOnInit() {
    // get item type from route
    this.activatedRoute.data
      .pipe(
        take(1),
        switchMap((data: Data) => {
          return of(data['type'] || '');
        })
      )
      .subscribe(type => (this.itemType = type));

    // get item id from route
    this.activatedRoute.paramMap
      .pipe(
        take(1),
        tap((params: ParamMap) => {
          if (params.get('id')) {
            // it is edit, get item details
            this.itemId = params.get('id') || '';
            this.portalItemService.getPortalDetails(this.itemId).subscribe(res => {
              this.configCompleted = res['configCompleted'];
              this.itemCaption = res['label'];
              this.dataSourceConnectionName = res['dataSourceConnectionName'];
              const next = res['currentStep'] || 'basic';

              // set activated index
              this.activatedIndex = this.steps.findIndex(x => x.routerLink === next);

              // navigate to the step that saved last time
              this.router.navigate([next], {
                relativeTo: this.activatedRoute,
                replaceUrl: true
              });
            });
          } else {
            // it is add
            this.itemId = undefined;
            this.configCompleted = false;
            this.itemCaption = undefined;
            this.activatedIndex = 0;
            this.router.navigate(['basic'], {
              relativeTo: this.activatedRoute,
              replaceUrl: true
            });
          }
          if (params.get('parentId')) {
            this.parentId = params.get('parentId') || '';
          }
        })
      )
      .subscribe();

    // set steps according to type
    if (this.itemType == 'single') {
      this.steps = [
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
          label: 'Add / Edit / Delete',
          routerLink: 'form'
        }
      ];
    } else if (this.itemType == 'linked') {
      this.steps = [
        {
          label: 'Basic',
          routerLink: 'basic'
        },
        {
          label: 'Data Source',
          routerLink: 'datasource'
        },
        {
          label: 'Search Configration',
          routerLink: 'search'
        }
      ];
    } else if (this.itemType == 'linked-single') {
      this.steps = [
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
          label: 'Add / Edit / Delete',
          routerLink: 'form'
        }
      ];
    }
  }

  onActivate(componentRef: any) {
    // set the activated index
    this.activatedIndex = this.steps.findIndex(step => {
      const routerLink = Array.isArray(step.routerLink) ? step.routerLink : [step.routerLink];
      return this.router.isActive(
        this.router.createUrlTree(routerLink, { relativeTo: this.activatedRoute }).toString(),
        {
          paths: 'subset',
          queryParams: 'subset',
          fragment: 'ignored',
          matrixParams: 'ignored'
        }
      );
    });

    const isLinkedSingle = this.itemType === 'linked-single';

    if (componentRef instanceof PortalEditStepDirective) {
      const child = componentRef as PortalEditStepDirective;
      child.isLastStep = this.activatedIndex + 1 === this.steps.length && !isLinkedSingle;
      // save and next
      child.saveNextEvent.pipe(takeUntil(this.destroy$)).subscribe(() => {
        const navigate = () => {
          let next = '';
          if (this.activatedIndex + 1 >= this.steps.length) {
            next = '../../';
          } else next = this.steps[this.activatedIndex + 1].routerLink;
          this.router.navigate([next], {
            relativeTo: this.activatedRoute
          });
        };
        // publish if current is the last step
        if (this.activatedIndex + 1 == this.steps.length) {
          this.portalItemService.saveCurrentStep('basic');
          this.portalItemService.publish(this.itemId as string).subscribe(res => {
            if (res.code === 200) {
              if (!isLinkedSingle) {
                this.notifyService.notifySuccess('Success', 'Save & Publish Successfully Completed.');
              }
              navigate();
            }
          });
        } else {
          navigate();
        }
      });

      // save draft and exit
      child.saveDraftEvent.pipe(takeUntil(this.destroy$)).subscribe(() => {
        if (!isLinkedSingle) {
          this.notifyService.notifySuccess('Success', 'Save Draft Successfully Completed.');
        }
        const next = this.itemId ? '../../' : '../';
        this.router.navigate([next], {
          relativeTo: this.activatedRoute
        });
      });

      // back
      child.backEvent.pipe(takeUntil(this.destroy$)).subscribe(() => {
        let next = '';
        if (this.activatedIndex - 1 < 0) next = this.itemId ? '../../' : '../';
        else next = this.steps[this.activatedIndex - 1].routerLink;
        this.router.navigate([next], {
          relativeTo: this.activatedRoute
        });
      });

      // cancel
      child.cancelEvent.pipe(takeUntil(this.destroy$)).subscribe(() => {
        const next = this.itemId ? '../../' : '../';
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

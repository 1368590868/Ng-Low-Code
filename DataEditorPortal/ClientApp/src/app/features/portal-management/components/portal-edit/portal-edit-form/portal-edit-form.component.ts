import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { forkJoin, tap } from 'rxjs';
import { NotifyService } from 'src/app/shared';
import {
  GridFormConfig,
  DataSourceTableColumn,
  GirdDetailConfig
} from '../../../models/portal-item';
import { PortalItemService } from '../../../services/portal-item.service';
import { FormLayoutComponent } from './form-layout/form-layout.component';

@Component({
  selector: 'app-portal-edit-form',
  templateUrl: './portal-edit-form.component.html',
  styleUrls: ['./portal-edit-form.component.scss']
})
export class PortalEditFormComponent implements OnInit {
  isLoading = true;
  isSaving = false;
  isSavingAndNext = false;
  isSavingAndExit = false;

  addingFormConfig: GridFormConfig = {};
  updatingFormConfig: GridFormConfig = {};
  infoFormConfig: GridFormConfig = {};

  dbColumns: DataSourceTableColumn[] = [];
  @ViewChild('addLayout') addLayout!: FormLayoutComponent;
  @ViewChild('updateLayout') updateLayout!: FormLayoutComponent;

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private changeDetectorRef: ChangeDetectorRef,
    private portalItemService: PortalItemService,
    private notifyService: NotifyService
  ) {}

  ngOnInit(): void {
    if (this.portalItemService.currentPortalItemId) {
      forkJoin([
        this.portalItemService.getGridFormConfig(),
        this.portalItemService.getDataSourceTableColumnsByPortalId()
      ]).subscribe(res => {
        this.isLoading = false;

        this.addingFormConfig = res[0].addingForm || {};
        this.updatingFormConfig = res[0].updatingForm || { sameAsAdd: true };
        this.infoFormConfig = res[0].infoForm || {};
        this.dbColumns = res[1];
      });

      this.portalItemService.saveCurrentStep('form');
    }
  }

  valid() {
    if (!this.addLayout.validate()) {
      this.notifyService.notifyWarning(
        'Warning',
        'Please complete the configuration for Adding.'
      );
      return false;
    }
    if (!this.updateLayout.validate()) {
      this.notifyService.notifyWarning(
        'Warning',
        'Please complete the configuration for Updating.'
      );
      return false;
    }
    return true;
  }

  saveGridFormConfig() {
    this.isSaving = true;

    const data: GirdDetailConfig = {
      addingForm: this.addLayout.getValue(),
      updatingForm: this.updateLayout.getValue(),
      infoForm: {}
    };

    if (this.portalItemService.currentPortalItemId) {
      this.portalItemService
        .saveGridFormConfig(data)
        .pipe(
          tap(res => {
            if (res && !res.isError) {
              this.saveSucess();
            }
            this.isSaving = false;
            this.isSavingAndExit = false;
            this.isSavingAndNext = false;
          })
        )
        .subscribe();
    }
  }

  saveSucess() {
    if (this.isSavingAndNext && this.portalItemService.currentPortalItemId) {
      this.portalItemService.saveCurrentStep('basic');
      this.portalItemService
        .publish(this.portalItemService.currentPortalItemId)
        .subscribe(res => {
          if (!res.isError) {
            this.notifyService.notifySuccess(
              'Success',
              'Save & Publish Successfully Completed.'
            );

            this.router.navigate(['../../../list'], {
              relativeTo: this.activatedRoute
            });
          } else {
            this.isSavingAndNext = false;
            this.isSaving = false;
          }
        });
    }
    if (this.isSavingAndExit) {
      this.notifyService.notifySuccess(
        'Success',
        'Save Draft Successfully Completed.'
      );
      this.router.navigate(['../../../list'], {
        relativeTo: this.activatedRoute
      });
    }
  }

  onSaveAndNext() {
    if (!this.valid()) return;
    this.isSavingAndNext = true;
    this.saveGridFormConfig();
  }

  onSaveAndExit() {
    if (!this.valid()) return;
    this.isSavingAndExit = true;
    this.saveGridFormConfig();
  }

  onBack() {
    this.router.navigate(['../search'], {
      relativeTo: this.activatedRoute
    });
  }
}

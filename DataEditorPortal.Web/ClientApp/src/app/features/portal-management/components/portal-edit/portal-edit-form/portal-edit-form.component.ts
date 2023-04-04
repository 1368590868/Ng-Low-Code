import { Component, OnInit, ViewChild } from '@angular/core';
import { forkJoin, tap } from 'rxjs';
import { NotifyService } from 'src/app/shared';
import { FormLayoutDeleteComponent } from '../..';
import {
  GridFormConfig,
  DataSourceTableColumn,
  GirdDetailConfig
} from '../../../models/portal-item';
import { PortalItemService } from '../../../services/portal-item.service';
import { FormLayoutComponent } from './form-layout/form-layout.component';
import { PortalEditStepDirective } from '../../../directives/portal-edit-step.directive';

@Component({
  selector: 'app-portal-edit-form',
  templateUrl: './portal-edit-form.component.html',
  styleUrls: ['./portal-edit-form.component.scss']
})
export class PortalEditFormComponent
  extends PortalEditStepDirective
  implements OnInit
{
  isLoading = true;
  isSaving = false;
  isSavingAndNext = false;
  isSavingAndExit = false;

  addingFormConfig: GridFormConfig = {};
  deleteFormConfig: GridFormConfig = {};
  updatingFormConfig: GridFormConfig = {};
  infoFormConfig: GridFormConfig = {};

  dbColumns: DataSourceTableColumn[] = [];
  @ViewChild('addLayout') addLayout!: FormLayoutComponent;
  @ViewChild('deleteLayout') deleteLayout!: FormLayoutDeleteComponent;
  @ViewChild('updateLayout') updateLayout!: FormLayoutComponent;

  dataSourceIsQueryText = false;

  set itemType(val: string | undefined) {
    this.portalItemService.itemType = val;
  }
  get itemType() {
    return this.portalItemService.itemType;
  }

  constructor(
    private portalItemService: PortalItemService,
    private notifyService: NotifyService
  ) {
    super();
  }

  ngOnInit(): void {
    if (this.portalItemService.itemId) {
      forkJoin([
        this.portalItemService.getGridFormConfig(),
        this.portalItemService.getDataSourceTableColumnsByPortalId(),
        this.portalItemService.getDataSourceConfig()
      ]).subscribe(res => {
        this.isLoading = false;
        this.addingFormConfig = res[0].addingForm || {};
        this.deleteFormConfig = res[0].deletingForm || {};
        this.updatingFormConfig = res[0].updatingForm || { sameAsAdd: true };
        this.infoFormConfig = res[0].infoForm || {};

        // if itemType is 'linked-single', we should always add linkedTableField to the source dbColumns
        this.dbColumns = res[1].concat([
          {
            filterType: 'linkDataField',
            columnName: 'LINK_DATA_FIELD',
            isKey: false,
            isAutoIncrement: false,
            isIdentity: false,
            isUnique: false,
            allowDBNull: true
          }
        ]);

        this.dataSourceIsQueryText = !!res[2].queryText;
      });

      this.portalItemService.saveCurrentStep('form');
    }
  }

  valid() {
    if (!this.addLayout.validate()) {
      return false;
    }
    if (!this.updateLayout.validate()) {
      return false;
    }
    if (!this.deleteLayout.validate()) {
      return false;
    }
    return true;
  }

  saveGridFormConfig() {
    this.isSaving = true;

    const data: GirdDetailConfig = {
      addingForm: this.addLayout.getValue(),
      updatingForm: this.updateLayout.getValue(),
      deletingForm: this.deleteLayout.getValue(),
      infoForm: {}
    };

    if (this.portalItemService.itemId) {
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
    if (this.isSavingAndNext) {
      this.saveNextEvent.emit();
    }
    if (this.isSavingAndExit) {
      this.saveDraftEvent.emit();
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
    this.backEvent.emit();
  }
}

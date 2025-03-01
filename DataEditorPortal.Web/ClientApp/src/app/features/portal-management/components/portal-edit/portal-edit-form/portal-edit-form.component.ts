import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { forkJoin, tap } from 'rxjs';
import { FormLayoutDeleteComponent } from '../..';
import { PortalEditStepDirective } from '../../../directives/portal-edit-step.directive';
import {
  DataSourceTableColumn,
  FieldControlType,
  GirdDetailConfig,
  GridFormConfig,
  GridFormField
} from '../../../models/portal-item';
import { PortalItemService } from '../../../services/portal-item.service';
import { FormLayoutComponent } from './form-layout/form-layout.component';

@Component({
  selector: 'app-portal-edit-form',
  templateUrl: './portal-edit-form.component.html',
  styleUrls: ['./portal-edit-form.component.scss']
})
export class PortalEditFormComponent extends PortalEditStepDirective implements OnInit {
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
    @Inject('FROM_DESIGNER_CONTROLS') public controls: FieldControlType[]
  ) {
    super();
  }

  ngOnInit(): void {
    if (this.portalItemService.itemId) {
      forkJoin([
        this.portalItemService.getGridFormConfig(),
        this.portalItemService.getDataSourceTableColumnsByPortalId(true),
        this.portalItemService.getDataSourceConfig()
      ]).subscribe(res => {
        this.isLoading = false;

        this.addingFormConfig = this.buildFields(res[0].addingForm, res[1]);
        this.deleteFormConfig = this.buildFields(res[0].deletingForm, res[1]);
        this.updatingFormConfig = this.buildFields(res[0].updatingForm || { useAddingFormLayout: true }, res[1]);
        this.infoFormConfig = this.buildFields(res[0].infoForm, res[1]);

        // if itemType is 'linked-single', we should always add linkedTableField to the source dbColumns
        if (this.itemType === 'linked-single') {
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
        } else {
          this.dbColumns = res[1];
        }

        this.dataSourceIsQueryText = !!res[2].queryText;
      });

      this.portalItemService.saveCurrentStep('form');
    }
  }

  buildFields(config: GridFormConfig | undefined, dbCols: DataSourceTableColumn[]) {
    if (config && config.formFields) {
      config.formFields = config.formFields.filter(
        c => this.isCustomControl(c) || dbCols.find(s => s.columnName === c.key && s.filterType === c.filterType)
      );
    }
    return config || {};
  }

  isCustomControl(field: GridFormField) {
    const control = this.controls.find(c => c.filterType === field.filterType && c.value === field.type);
    return control ? control.isCustom : false;
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
            if (res && res.code === 200) {
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

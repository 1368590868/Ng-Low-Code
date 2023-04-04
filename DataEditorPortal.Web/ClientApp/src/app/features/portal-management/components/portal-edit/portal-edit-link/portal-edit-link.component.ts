import { Component, OnInit } from '@angular/core';
import { PortalEditStepDirective } from '../../../directives/portal-edit-step.directive';
import { PortalItemService } from '../../../services/portal-item.service';
import { NotifyService } from 'src/app/shared';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import {
  LinkedDataSourceConfig,
  LinkedTableConfig
} from '../../../models/portal-item';
@Component({
  selector: 'app-portal-edit-link',
  templateUrl: './portal-edit-link.component.html',
  styleUrls: ['./portal-edit-link.component.scss']
})
export class PortalEditLinkComponent
  extends PortalEditStepDirective
  implements OnInit
{
  isLoading = true;
  isSaving = false;
  isSavingAndNext = false;
  isSavingAndExit = false;

  set itemId(val: string | undefined) {
    this.portalItemService.itemId = val;
  }
  get itemId() {
    return this.portalItemService.itemId;
  }

  dataSourceConfig!: LinkedDataSourceConfig;
  primaryTable: LinkedTableConfig[] = [];
  secondaryTable: LinkedTableConfig[] = [];
  secondarySelected: string[] = [];
  primarySelected: string[] = [];

  constructor(
    private portalItemService: PortalItemService,
    private router: Router,
    private route: ActivatedRoute,
    private notifyService: NotifyService
  ) {
    super();
  }

  ngOnInit(): void {
    this.portalItemService.saveCurrentStep('datasource');
    this.portalItemService
      .getLinkedDatasource(this.itemId as string)
      .subscribe(res => {
        if (!res.isError) {
          const { result } = res;
          this.dataSourceConfig = result || {};
          this.isLoading = false;

          this.primarySelected =
            this.dataSourceConfig.primaryTable?.columnsForLinkedField || [];
          this.secondarySelected =
            this.dataSourceConfig.secondaryTable?.columnsForLinkedField || [];

          if (result?.primaryTable?.id != null) {
            this.portalItemService
              .getPortalDetails(result.primaryTable.id)
              .subscribe(item => {
                this.primaryTable = [item];
              });
          }

          if (result?.secondaryTable?.id != null) {
            this.portalItemService
              .getPortalDetails(result.secondaryTable.id)
              .subscribe(item => {
                this.secondaryTable = [item];
              });
          }
        }
      });
  }

  onAddSecondaryTable() {
    if (this.dataSourceConfig.primaryTable == null) {
      this.notifyService.notifyWarning(
        'Warning',
        'Please select primary table first.'
      );
    } else {
      this.router.navigate(['./add'], { relativeTo: this.route });
    }
  }

  valid() {
    if (
      this.primaryTable.length === 0 ||
      this.secondaryTable.length === 0 ||
      this.primarySelected.length === 0 ||
      this.secondarySelected.length === 0
    ) {
      this.notifyService.notifyWarning('Warning', 'Please Check Your Data.');
      return false;
    }
    return true;
  }

  onSaveAndNext() {
    this.isSavingAndNext = true;
    if (this.valid()) {
      this.portalItemService
        .saveLinkedDatasource({
          primaryTable: {
            id: this.dataSourceConfig.primaryTable?.id,
            columnsForLinkedField: this.primarySelected
          },
          secondaryTable: {
            id: this.dataSourceConfig.secondaryTable?.id,
            columnsForLinkedField: this.secondarySelected
          }
        })
        .subscribe(res => {
          if (!res.isError) {
            this.saveSucess();
          }
        });
    }
  }

  onSaveAndExit() {
    this.isSavingAndExit = true;
    if (this.valid()) {
      this.saveSucess();
    }
  }

  saveSucess() {
    if (this.isSavingAndNext) {
      this.portalItemService.saveCurrentStep('search');
      this.saveNextEvent.emit();
    }
    if (this.isSavingAndExit) {
      this.saveDraftEvent.emit();
    }
  }

  onBack() {
    this.backEvent.emit();
  }
}

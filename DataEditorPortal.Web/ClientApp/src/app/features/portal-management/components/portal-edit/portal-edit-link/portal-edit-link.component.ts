import { Component, OnInit } from '@angular/core';
import { PortalEditStepDirective } from '../../../directives/portal-edit-step.directive';
import { PortalItemService } from '../../../services/portal-item.service';
import { NotifyService } from 'src/app/shared';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
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

  tableConfig!: { primaryTable: any; secondaryTable: any; linkedTable: any };
  primaryTable: any[] = [];
  secondaryTable: any[] = [];
  selectedColumns: any[] = [];
  columnsForLinkedOptions: any[] = [];

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
      .getLinkedData(this.itemId as string)
      .subscribe(res => {
        this.tableConfig = res.result;
        this.columnsForLinkedOptions =
          res.linkedTableConfig.columnsForLinkedField || [];
        this.isLoading = false;

        if (res && res.result.primaryTable?.id) {
          this.portalItemService
            .getPortalDetails(res.result.primaryTable.id)
            .subscribe(item => {
              if (item['name']) {
                this.primaryTable = [item];
              }
            });
        }

        if (res && res.result.secondaryTable?.id) {
          this.portalItemService
            .getPortalDetails(res.result.secondaryTable.id)
            .subscribe(item => {
              if (item['name']) {
                this.secondaryTable = [item];
              }
            });
        }
      });
  }

  onAddSecondaryTable() {
    if (this.tableConfig.primaryTable == null) {
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
      this.selectedColumns.length === 0
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
        .saveLinkedData({
          primaryTable: this.primaryTable,
          secondaryTable: this.secondaryTable,
          linkedTableConfig: this.selectedColumns
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

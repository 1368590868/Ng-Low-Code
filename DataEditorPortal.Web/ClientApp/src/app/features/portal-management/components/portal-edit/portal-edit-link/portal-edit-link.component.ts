import { Component, OnInit } from '@angular/core';
import { PortalEditStepDirective } from '../../../directives/portal-edit-step.directive';
import { PortalItemService } from '../../../services/portal-item.service';

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

  constructor(private portalItemService: PortalItemService) {
    super();
  }

  ngOnInit(): void {
    this.portalItemService.saveCurrentStep('datasource');
  }

  onSaveAndNext() {
    this.isSavingAndNext = true;
    this.saveSucess();
  }

  onSaveAndExit() {
    this.isSavingAndExit = true;
    this.saveSucess();
  }

  saveSucess() {
    if (this.isSavingAndNext) {
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

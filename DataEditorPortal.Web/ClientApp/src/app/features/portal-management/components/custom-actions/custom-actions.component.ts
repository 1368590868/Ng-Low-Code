import { Component, Inject, Input } from '@angular/core';
import { FormControl } from '@angular/forms';
import { GridActionConfig } from 'src/app/features/universal-grid-action';
import { NotifyService } from 'src/app/shared';
import { PortalItemService } from '../../services/portal-item.service';

@Component({
  selector: 'app-custom-actions',
  templateUrl: './custom-actions.component.html',
  styleUrls: ['./custom-actions.component.scss']
})
export class CustomActionsComponent {
  public optionArr: FormControl[] = [];

  @Input() portalItemId?: string;

  public visible = false;
  public buttonDisabled = false;
  public isLoading = false;

  customActions: { label: string | undefined; value: string }[] = [];

  constructor(
    @Inject('GRID_ACTION_CONFIG')
    public customActionsConfig: GridActionConfig[],
    private notifyService: NotifyService,
    private portalItemService: PortalItemService
  ) {
    this.customActions = customActionsConfig
      .filter(x => x.isCustom)
      .map(x => {
        return { label: x.label, value: x.name };
      });
  }

  onRemoveFilter(filter: FormControl) {
    this.optionArr = this.optionArr.filter(item => item !== filter);
  }

  onAdd() {
    this.optionArr = [...this.optionArr, new FormControl()];
  }

  showDialog() {
    if (!this.portalItemId) throw new Error('Portal Item Id can not be undefined. ');
    this.portalItemService.getCustomActions(this.portalItemId).subscribe(res => {
      this.optionArr = res.map(item => {
        return new FormControl(item.name);
      });

      this.visible = true;
    });
  }

  onOk() {
    if (!this.portalItemId) throw new Error('Portal Item Id can not be undefined. ');

    const isValid = this.optionArr
      .map(item => {
        item.markAsTouched();
        return item.valid;
      })
      .find(item => item === false);
    if (isValid !== false) {
      const data = this.optionArr.map(item => {
        return { name: item.value };
      });
      this.portalItemService.saveCustomActions(this.portalItemId, data).subscribe(res => {
        if (res && res.code === 200) {
          this.notifyService.notifySuccess('Success', 'Custom Actions Successfully Saved.');
          this.visible = false;
        }
      });
    }
  }

  onCancel() {
    this.visible = false;
  }
}

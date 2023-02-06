import { Component, EventEmitter, Inject, Input, Output } from '@angular/core';
import { FormControl } from '@angular/forms';
import { NotifyService } from 'src/app/core/utils/notify.service';
import { GridActionConfig } from 'src/app/features/universal-grid-action';

@Component({
  selector: 'app-custom-actions',
  templateUrl: './custom-actions.component.html',
  styleUrls: ['./custom-actions.component.scss']
})
export class CustomActionsComponent {
  public optionArr: FormControl[] = [];
  @Output() actionsChange: EventEmitter<string[]> = new EventEmitter<
    string[]
  >();
  @Input()
  set actions(val: any) {
    let funVal: FormControl[] = [];
    if (val.length > 0) {
      funVal = val.map((item: any) => {
        return new FormControl(item);
      });
    }
    this.optionArr = [...this.optionArr, ...funVal];
  }
  public visible = false;
  public buttonDisabled = false;
  public isLoading = false;

  customActions: { label: string | undefined; value: string }[] = [];

  constructor(
    @Inject('GRID_ACTION_CONFIG')
    public customActionsConfig: GridActionConfig[],
    private notifyService: NotifyService
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
    this.visible = true;
  }

  onOk() {
    const isValid = this.optionArr
      .map((item: any) => {
        item.markAsDirty();
        return item.valid;
      })
      .find(item => item === false);
    if (isValid !== false) {
      let saveData: string[] = [];
      const optionLabel = this.optionArr.map((item: any) => item.value);
      saveData = optionLabel;

      if (saveData.length > 0 && saveData[0] != null) {
        this.actionsChange.emit(saveData);
        this.visible = false;
      } else {
        this.notifyService.notifyWarning('Warning', 'Please select Data');
      }
    }
  }

  onCancel() {
    this.visible = false;
  }
}

import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
  FormControl,
  ControlValueAccessor,
  NG_VALUE_ACCESSOR
} from '@angular/forms';
import { FieldType, FieldTypeConfig } from '@ngx-formly/core';
import { DataSourceConnection } from '../../models/portal-item';
import { LookupService } from '../../services/lookup.service';
import { PortalItemService } from '../../services/portal-item.service';

interface OptionItem {
  formControl: FormControl;
  label?: string;
}

@Component({
  selector: 'app-option-dialog',
  templateUrl: './option-dialog.component.html',
  styleUrls: ['./option-dialog.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: OptionDialogComponent,
      multi: true
    }
  ]
})
export class OptionDialogComponent implements ControlValueAccessor {
  isAdvanced = false;
  optionsLookup?: string;
  options: any[] = [];
  onChange?: any;
  onTouch?: any;
  disabled = false;

  visible = false;
  isLoading = false;

  dbConnections: { label: string; value: string }[] = [];

  formControlConnection: FormControl = new FormControl();
  formControlOptions: OptionItem[] = [];
  formControlName: FormControl = new FormControl();
  formControlQuery: FormControl = new FormControl();

  constructor(
    private lookupService: LookupService,
    private portalItemService: PortalItemService
  ) {}

  set value(val: string | any[]) {
    if (Array.isArray(val)) {
      this.options = val;
    } else if (val) {
      this.optionsLookup = val;
    } else {
      this.options = [];
      this.optionsLookup = undefined;
    }
    this.onChange?.(val);
    this.onTouch?.(val);
  }
  writeValue(value: any): void {
    this.value = value;
  }
  registerOnChange(fn: any): void {
    this.onChange = fn;
  }
  registerOnTouched(fn: any): void {
    this.onTouch = fn;
  }
  setDisabledState?(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  onMonacoInit() {
    setTimeout(() => {
      this.formControlQuery.markAsPristine();
    });
  }

  changeMode() {
    this.isAdvanced = !this.isAdvanced;
    if (this.isAdvanced) {
      this.formControlName.reset();
      this.formControlQuery.reset();
      this.getOptionQueryDetail();
    }
  }

  onRemoveFilter(filter: OptionItem) {
    this.formControlOptions = this.formControlOptions.filter(
      item => item !== filter
    );
  }

  onAdd() {
    this.formControlOptions = [
      ...this.formControlOptions,
      { formControl: new FormControl() }
    ];
  }

  getOptionQueryDetail() {
    this.formControlOptions = [];
    this.portalItemService.getDataSourceConnections().subscribe(res => {
      const connections: DataSourceConnection[] = res;
      if (connections.length === 0) return;
      this.dbConnections = connections.map(x => {
        return { label: x.name, value: x.id || '' };
      });
      if (this.optionsLookup) {
        this.lookupService.getOptionQuery(this.optionsLookup).subscribe(res => {
          this.formControlName.setValue(res?.name);
          this.formControlQuery.setValue(res?.queryText);

          // check if current selected connections exists, if not exist, use the first
          if (!connections.find(x => x.id === res?.connectionId)) {
            this.formControlConnection.setValue(connections[0].id);
          } else {
            this.formControlConnection.setValue(res?.connectionId);
          }
        });
      } else {
        this.formControlConnection.setValue(connections[0].id);
      }
    });
  }

  showDialog() {
    this.isAdvanced =
      (!this.options || this.options.length === 0) && !!this.optionsLookup;

    if (this.isAdvanced) {
      this.getOptionQueryDetail();
      this.visible = true;
    } else {
      if (this.options && this.options?.length > 0) {
        this.formControlOptions = this.options.map(item => {
          return { ...item, formControl: new FormControl(item.label) };
        });
      } else {
        this.formControlOptions = [];
      }
      this.visible = true;
    }
  }

  validate() {
    if (this.isAdvanced) {
      if (!this.formControlConnection.valid) {
        this.formControlConnection.markAsDirty();
      }
      if (!this.formControlName.valid) {
        this.formControlName.markAsDirty();
      }
      if (!this.formControlQuery.valid) {
        this.formControlQuery.markAsDirty();
      }
      return (
        this.formControlConnection.valid &&
        this.formControlName.valid &&
        this.formControlQuery.valid
      );
    } else {
      const valid = this.formControlOptions.reduce((r, x) => {
        if (!x.formControl.valid) {
          x.formControl.markAsDirty();
          x.formControl.updateValueAndValidity();
        }
        return r && x.formControl.valid;
      }, true);

      return valid;
    }
  }

  onOk() {
    if (this.validate()) {
      if (this.isAdvanced) {
        this.isLoading = true;
        this.lookupService
          .saveOptionQuery({
            id: this.optionsLookup || '',
            name: this.formControlName.value,
            queryText: this.formControlQuery.value,
            connectionId: this.formControlConnection.value
          })
          .subscribe(res => {
            this.isLoading = false;
            if (res && !res.isError) {
              this.options = [];
              this.optionsLookup = res.result;
              this.onChange(this.optionsLookup);
              this.visible = false;
            }
          });
      } else {
        this.optionsLookup = undefined;
        this.options = this.formControlOptions.map(item => {
          return {
            label: item.formControl.value,
            value: item.formControl.value
          };
        });
        this.onChange(this.options);
        this.visible = false;
      }
    }
  }

  onCancel() {
    this.visible = false;
  }

  /* db connection dialog */
  connectionSaved(item: { label: string; value: string }) {
    this.dbConnections.push(item);
    this.formControlConnection.setValue(item.value);
  }
  /* db connection dialog */
}

@Component({
  selector: 'app-formly-field-options-editor',
  template: `
    <app-option-dialog
      [formControl]="formControl"
      [formlyAttributes]="field"
      (onChange)="
        props.change && props.change(field, $event)
      "></app-option-dialog>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FormlyFieldOptionsEditorComponent extends FieldType<
  FieldTypeConfig<any>
> {}

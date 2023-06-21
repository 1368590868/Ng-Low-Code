import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import {
  FormControl,
  ControlValueAccessor,
  NG_VALUE_ACCESSOR
} from '@angular/forms';
import { FieldType, FieldTypeConfig } from '@ngx-formly/core';
import { NotifyService } from 'src/app/shared';
import { DataSourceConnection } from '../../models/portal-item';
import { LookupService } from '../../services/lookup.service';
import { PortalItemService } from '../../services/portal-item.service';
import { Lookup } from '../../models/lookup';

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
  @Input() onlyAdvanced!: boolean;
  @Input() dialogTitle!: string;
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

  helperMessage =
    'Enter some query text to get options from database.  <br />' +
    'It needs return two columns at least. Use format ##FIELD## to reference other fields in same form as parameters. And use {{}} mark the criteria is optional.   <br />' +
    '<br />' +
    "SELECT LABEL, VALUE, VALUE1, VALUE2 <br />FROM DATA_DICTIONARIES <br />WHERE CATEGORY = 'Employer' {{ AND VALUE1 IN ##VENDOR## }} <br />ORDER BY LABEL";

  get dataSourceConnectionName() {
    return this.portalItemService.dataSourceConnectionName;
  }

  constructor(
    private lookupService: LookupService,
    private portalItemService: PortalItemService,
    private notifyService: NotifyService
  ) {
    this.formControlConnection.disable();
  }

  set value(val: { id: string } | any[]) {
    if (Array.isArray(val)) {
      this.options = val;
    } else if (val) {
      this.optionsLookup = val.id || (val as unknown as string);
    } else {
      this.options = [];
      this.optionsLookup = undefined;
    }
    // this.onChange?.(val);
    // this.onTouch?.(val);
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
        return { label: x.name, value: x.name || '' };
      });
      this.formControlConnection.setValue(this.dataSourceConnectionName);
      if (this.optionsLookup) {
        this.lookupService.getOptionQuery(this.optionsLookup).subscribe(res => {
          this.formControlName.setValue(res?.name);
          this.formControlQuery.setValue(res?.queryText);
        });
      }

      this.formControlQuery.markAsPristine();
    });
  }

  showDialog() {
    this.isAdvanced =
      ((!this.options || this.options.length === 0) && !!this.optionsLookup) ||
      this.onlyAdvanced;
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
      if (!this.formControlName.valid) {
        this.formControlName.markAsDirty();
      }
      if (!this.formControlQuery.valid) {
        this.formControlQuery.markAsDirty();
      }
      if (!this.formControlQuery.value) {
        this.notifyService.notifyWarning('', 'Query  Text is required.');
      }
      return this.formControlName.valid && this.formControlQuery.valid;
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
        const data: Lookup = {
          id: this.optionsLookup,
          name: this.formControlName.value,
          queryText: this.formControlQuery.value,
          connectionName: this.formControlConnection.value,
          portalItemId: this.portalItemService.itemId
        };
        this.lookupService.saveOptionQuery(data).subscribe(res => {
          this.isLoading = false;
          if (res && !res.isError) {
            this.options = [];
            this.optionsLookup = res.result;

            const matches = [
              ...data.queryText.matchAll(/##([a-zA-Z]{1}[a-zA-Z0-9_]+?)##/g)
            ];
            const deps = matches
              .map(match => match[1]) // get the field name
              .filter((value, index, array) => array.indexOf(value) === index); // distinct

            this.onChange({ id: this.optionsLookup, deps });
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
}

@Component({
  selector: 'app-formly-field-options-editor',
  template: `
    <app-option-dialog
      [formControl]="formControl"
      [formlyAttributes]="field"
      (onChange)="props.change && props.change(field, $event)"
      [dialogTitle]="props.dialogTitle || 'Options'"
      [onlyAdvanced]="props.onlyAdvanced || false"></app-option-dialog>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FormlyFieldOptionsEditorComponent extends FieldType<
  FieldTypeConfig<any>
> {}

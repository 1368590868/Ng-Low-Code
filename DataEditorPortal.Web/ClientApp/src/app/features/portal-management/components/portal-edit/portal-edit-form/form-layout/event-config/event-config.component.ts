import { Type } from '@angular/core';
import { Component, Inject, Input, OnInit } from '@angular/core';
import {
  ControlValueAccessor,
  FormControl,
  NG_VALUE_ACCESSOR
} from '@angular/forms';
import { EventActionHandlerService } from 'src/app/features/universal-grid-action/services/event-action-handler.service';

@Component({
  selector: 'app-event-config',
  templateUrl: './event-config.component.html',
  styleUrls: ['./event-config.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: EventConfigComponent,
      multi: true
    }
  ]
})
export class EventConfigComponent implements ControlValueAccessor, OnInit {
  @Input() value!: any;

  onChange?: any;
  onTouch?: any;
  disabled = false;
  isJs = false;
  jsOptions: { label: string; value: string }[] = [];
  language = 'sql';
  scriptText = null;
  @Input() labelName = 'On Validate';

  typeOptions = [
    { label: 'Query Text', value: 'QueryText' },
    { label: 'Command Line', value: 'CommandLine' },
    { label: 'Query Stored Procedure', value: 'QueryStoredProcedure' },
    { label: 'Javascript', value: 'Javascript' }
  ];

  writeValue(value: any): void {
    this.scriptText = value?.script ?? null;
    this.formControlType.setValue(value?.eventType);
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

  formControlType = new FormControl();
  formControlText = new FormControl();

  helperMessage =
    '-- Enter the query text . \r\n\r\n' +
    '-- E.g. \r\n' +
    '-- SELECT Max(AMOUNT) FROM DEMO_TABLE';

  constructor(
    @Inject('EVENT_ACTION_CONFIG')
    private EVENT_ACTION_CONFIG: {
      name: string;
      handler: Type<EventActionHandlerService>;
    }[]
  ) {
    this.jsOptions = this.EVENT_ACTION_CONFIG.map(item => ({
      label: item.name,
      value: item.name
    }));
  }

  ngOnInit(): void {
    this.formControlType.valueChanges.subscribe(val => {
      if (val === 'CommandLine') {
        this.language = 'bat';
        this.helperMessage = 'rem Enter the command line . ';
        this.formControlText.setValue(this.scriptText ?? this.helperMessage);
      } else if (val !== 'Javascript') {
        this.language = 'sql';
        this.helperMessage = '-- Enter the query text . ';
        this.formControlText.setValue(this.scriptText ?? this.helperMessage);
      }

      const isJsText = this.jsOptions.find(x => this.scriptText === x.value);

      if (val === 'Javascript') {
        this.formControlText.setValue(this.scriptText, { emitEvent: false });
        if (!isJsText) {
          this.formControlText.setValue(null, { emitEvent: false });
        }
        this.isJs = true;
      } else {
        if (isJsText) {
          this.formControlText.setValue(this.helperMessage, {
            emitEvent: false
          });
        }
        this.isJs = false;
      }

      this.onChange?.({
        eventType: this.formControlType.value,
        script:
          this.formControlText.value === this.helperMessage
            ? null
            : this.formControlText.value
      });
    });
    this.formControlText.valueChanges.subscribe(() => {
      if (
        this.formControlText.value === this.helperMessage ||
        !this.formControlText.value
      ) {
        this.onChange?.({
          eventType: this.formControlType.value
        });
      } else {
        this.onChange?.({
          eventType: this.formControlType.value,
          script:
            this.formControlText.value === this.helperMessage
              ? null
              : this.formControlText.value
        });
      }
    });
  }

  onMonacoEditorInit(editor: any) {
    editor.onMouseDown(() => {
      if (this.formControlText.value === this.helperMessage) {
        this.formControlText.reset();
        setTimeout(() => {
          this.formControlText.markAsPristine();
        }, 100);
      }
    });
    editor.onDidBlurEditorText(() => {
      if (!this.formControlText.value) {
        this.formControlText.setValue(this.helperMessage, { emitEvent: false });
      }
    });
  }

  onClear() {
    this.formControlText.setValue(undefined);
  }
}

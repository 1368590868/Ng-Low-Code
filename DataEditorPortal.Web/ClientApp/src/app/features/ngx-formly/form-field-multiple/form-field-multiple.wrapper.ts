import { trigger, transition, style, animate } from '@angular/animations';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';

import {
  FieldWrapper,
  FormlyFieldConfig,
  FormlyFieldProps as CoreFormlyFieldProps
} from '@ngx-formly/core';

export interface FormlyFieldProps extends CoreFormlyFieldProps {
  hideRequiredMarker?: boolean;
  hideLabel?: boolean;
  helperText?: string;
  isSameValue?: boolean;
  fieldsCopy: FormlyFieldConfig[];
}

@Component({
  selector: 'app-formly-wrapper-primeng-form-field-multiple',
  template: `
    <div class="flex align-item-center">
      <span class="mr-4" [style.paddingTop]="'0.4167rem'">
        <p-checkbox
          [ngModel]="this.props.isSameValue"
          (ngModelChange)="checkboxChange($event)"
          [binary]="true"
          inputId="binary"></p-checkbox>
      </span>

      <div class="p-field  w-full">
        <label
          *ngIf="props.label && props.hideLabel !== true"
          [for]="id"
          class="flex align-items-center">
          {{ props.label }}
          <span
            *ngIf="
              props.isSameValue &&
              props.required &&
              props.hideRequiredMarker !== true
            "
            aria-hidden="true"
            class="text-red-500"
            >*</span
          >
          <i
            *ngIf="props.description"
            class="pi pi-question-circle ml-2"
            [pTooltip]="props.description"
            [hideDelay]="500"
            [escape]="false"></i>
        </label>

        <ng-container *ngIf="props?.isSameValue" #fieldComponent></ng-container>
        <div *ngIf="!props?.isSameValue">
          <span class="p-input-icon-right">
            <i
              class="pi pi-exclamation-circle text-lg text-warning-500"
              style="color: var(--yellow-600);z-index:1;"
              [pTooltip]="
                'The field values are different,If the check box is true, all values are the same'
              "
              [hideDelay]="500"
              [escape]="false"></i>
            <input
              pInputText
              [disabled]="true"
              [ngModel]="'The field values are different'" />
          </span>
        </div>

        <small *ngIf="showError" class="p-error" @fadeInOut>
          <formly-validation-message
            class="ui-message-text"
            [field]="field"></formly-validation-message>
        </small>

        <small *ngIf="props?.helperText !== undefined" class="p-always">
          <span class="ui-message-text">{{ props.helperText }}</span>
        </small>
      </div>
    </div>
  `,
  animations: [
    trigger('fadeInOut', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('200ms', style({ opacity: 1 }))
      ]),
      transition(':leave', [animate('200ms', style({ opacity: 0 }))])
    ])
  ],
  styles: [
    `
      :host {
        .p-always {
          color: var(--primary-color);
          margin-left: 40%;
        }
      }
    `
  ]
})
export class FormlyWrapperFormFieldMultipleComponent
  extends FieldWrapper<FormlyFieldConfig<FormlyFieldProps>>
  implements OnInit
{
  customValidatorCopy: any;

  constructor(private cdr: ChangeDetectorRef) {
    super();
  }

  ngOnInit() {
    if (this.formControl.validator) {
      this.customValidatorCopy = this.formControl.validator;
    }
    if (this.props.isSameValue === undefined) {
      this.formControl.clearValidators();
    }
  }

  checkboxChange(value: boolean) {
    this.props.isSameValue = !!value;

    if (!value) {
      this.formControl.setErrors(null);
      this.formControl.clearValidators();
    } else {
      if (this.customValidatorCopy) {
        this.formControl.addValidators(this.customValidatorCopy);
      }
      this.cdr.detectChanges();
    }
  }
}

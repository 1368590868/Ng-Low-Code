import { trigger, transition, style, animate } from '@angular/animations';
import { Component } from '@angular/core';
import {
  FieldWrapper,
  FormlyFieldConfig,
  FormlyFieldProps as CoreFormlyFieldProps
} from '@ngx-formly/core';

export interface FormlyFieldProps extends CoreFormlyFieldProps {
  hideRequiredMarker?: boolean;
  hideLabel?: boolean;
}

@Component({
  selector: 'app-formly-wrapper-primeng-form-field',
  template: `
    <div class="p-field">
      <label
        *ngIf="props.label && props.hideLabel !== true"
        [for]="id"
        class="flex align-items-center">
        {{ props.label }}
        <span
          *ngIf="props.required && props.hideRequiredMarker !== true"
          aria-hidden="true"
          >*</span
        >
        <i
          *ngIf="props.description"
          class="pi pi-question-circle ml-2"
          [pTooltip]="props.description"
          [hideDelay]="500"
          [escape]="false"></i>
      </label>
      <ng-container #fieldComponent></ng-container>

      <small *ngIf="showError" class="p-error" @fadeInOut>
        <formly-validation-message
          class="ui-message-text"
          [field]="field"></formly-validation-message>
      </small>
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
  ]
})
export class FormlyWrapperFormFieldComponent extends FieldWrapper<
  FormlyFieldConfig<FormlyFieldProps>
> {}

import { NgModule } from '@angular/core';
import { FormlyPrimeNGModule } from '@ngx-formly/primeng';
import { FormlyCheckBoxModule } from './checkbox';
import { FormlyChipWrapperModule } from './chip';
import { FormlyDatepickerModule } from './datepicker';
import { DateValidatorModule } from './datevalidator';
import { FormlyDividerWrapperModule } from './divider';
import { FormlyFileUploadModule } from './file-upload/file-upload.modules';
import { FormlyFormFieldMultipleModule } from './form-field-multiple/form-field-multiple.module';
import { FormlyFormFieldModule } from './form-field/form-field.module';
import { FormlyGPSLocatorModule } from './gps-locator/gps-locator.modules';
import { FormlyIconSelectModule } from './iconselect';
import { FormlyInputMaskModule } from './inputMask';
import { FormlyInputNumberModule } from './inputnumber';
import { FormlyLinkDataEditorModule } from './link-data-editor';
import { FormlyLocationEditorModule } from './location-editor/location-editor.modules';
import { FormlyMonacoEditorModule } from './monacoEditor';
import { FormlyMultiSelectModule } from './multiselect';
import { FormlySelectModule } from './select';
import { FormlyTriStateCheckBoxModule } from './triStateCheckbox';
import { UniversalRegexpModule } from './universalregexp';

@NgModule({
  imports: [
    FormlyPrimeNGModule,
    FormlyDatepickerModule,
    FormlyMultiSelectModule,
    FormlyInputMaskModule,
    FormlySelectModule,
    FormlyDividerWrapperModule,
    FormlyCheckBoxModule,
    FormlyChipWrapperModule,
    FormlyIconSelectModule,
    FormlyInputNumberModule,
    FormlyMonacoEditorModule,
    FormlyTriStateCheckBoxModule,
    DateValidatorModule,
    UniversalRegexpModule,
    FormlyFileUploadModule,
    FormlyFormFieldModule,
    FormlyFormFieldMultipleModule,
    FormlyLinkDataEditorModule,
    FormlyLocationEditorModule,
    FormlyGPSLocatorModule
  ],
  declarations: []
})
export class FormlyCustomTypeModule {}

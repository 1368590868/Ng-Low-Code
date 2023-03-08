import { NgModule } from '@angular/core';
import { FormlyPrimeNGModule } from '@ngx-formly/primeng';
import { FormlyCheckBoxModule } from './checkbox';
import { FormlyChipWrapperModule } from './chip';
import { FormlyDatepickerModule } from './datepicker';
import { FormlyDividerWrapperModule } from './divider';
import { FormlyIconSelectModule } from './iconselect';
import { FormlyInputMaskModule } from './inputMask';
import { FormlyInputNumberModule } from './inputnumber';
import { FormlyMultiSelectModule } from './multiselect';
import { FormlySelectModule } from './select';
import { FormlyMonacoEditorModule } from './monacoEditor';
import { DateValidatorModule } from './datevalidator';
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
    DateValidatorModule,
    UniversalRegexpModule
  ]
})
export class FormlyCustomTypeModule {}

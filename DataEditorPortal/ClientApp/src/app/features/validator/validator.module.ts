import { NgModule } from '@angular/core';
import { CurrentDateModule } from './currentdate';
import { UniversalRegexpModule } from './universalregexp';

@NgModule({
  imports: [CurrentDateModule, UniversalRegexpModule]
})
export class ValidatorModule {}

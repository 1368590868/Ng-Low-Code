import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { UniversalGridComponent } from './universal-grid.component';

const routes: Routes = [{ path: '', component: UniversalGridComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UniversalGridRoutingModule {}

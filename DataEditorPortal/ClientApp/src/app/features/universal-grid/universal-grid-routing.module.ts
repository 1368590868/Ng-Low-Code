import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SplitAreaComponent } from './pages/split-area/split-area.component';

const routes: Routes = [{ path: '', component: SplitAreaComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UniversalGridRoutingModule {}

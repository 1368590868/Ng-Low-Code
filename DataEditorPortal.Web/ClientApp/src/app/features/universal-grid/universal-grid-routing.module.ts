import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SplitAreaComponent } from './pages/split-area/split-area.component';

const routes: Routes = [
  {
    path: 'single/:name',
    component: SplitAreaComponent,
    data: { type: 'single' }
  },
  {
    path: 'linked/:name',
    component: SplitAreaComponent,
    data: { type: 'linked' }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UniversalGridRoutingModule {}

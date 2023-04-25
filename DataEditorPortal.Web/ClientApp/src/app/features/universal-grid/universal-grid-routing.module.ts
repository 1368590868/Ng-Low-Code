import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SplitAreaComponent } from './pages/split-area/split-area.component';
import { PermissionRouterGuard } from './permission-router.guard';

const routes: Routes = [
  {
    path: 'single/:name',
    component: SplitAreaComponent,
    data: { type: 'single' },
    canActivate: [PermissionRouterGuard]
  },
  {
    path: 'linked/:name',
    component: SplitAreaComponent,
    data: { type: 'linked' },
    canActivate: [PermissionRouterGuard]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UniversalGridRoutingModule {}

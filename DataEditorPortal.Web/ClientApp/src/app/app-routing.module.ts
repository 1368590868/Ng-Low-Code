import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { routes } from './features/core';

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
  providers: [
    {
      provide: 'STATIC_ROUTES',
      useValue: routes
    }
  ]
})
export class AppRoutingModule {}

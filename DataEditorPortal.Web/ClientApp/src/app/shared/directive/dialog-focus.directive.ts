import { Directive, Host, OnDestroy, Renderer2 } from '@angular/core';
import { Dialog } from 'primeng/dialog';
import { Subject } from 'rxjs';
import { takeUntil, tap } from 'rxjs/operators';

@Directive({
  // eslint-disable-next-line @angular-eslint/directive-selector
  selector: 'p-dialog'
})
export class DialogFocusDirective implements OnDestroy {
  unbindDialogClickListener!: any;

  destroy$ = new Subject();

  constructor(@Host() private dialog: Dialog, private renderer: Renderer2) {
    this.dialog.onShow
      .pipe(
        takeUntil(this.destroy$),
        tap(() => {
          if (this.dialog.container)
            this.unbindDialogClickListener = this.renderer.listen(
              this.dialog.container,
              'click',
              () => {
                this.dialog.moveOnTop();
              }
            );
        })
      )
      .subscribe();

    this.dialog.onHide
      .pipe(
        takeUntil(this.destroy$),
        tap(() => {
          if (this.unbindDialogClickListener) {
            this.unbindDialogClickListener();
            this.unbindDialogClickListener = null;
          }
        })
      )
      .subscribe();
  }

  ngOnDestroy(): void {
    this.destroy$.next(null);
    this.destroy$.complete;
  }
}

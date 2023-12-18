import { DOCUMENT } from '@angular/common';
import { Directive, Host, Inject, OnDestroy, Renderer2 } from '@angular/core';
import { Dialog } from 'primeng/dialog';
import { DomHandler } from 'primeng/dom';
import { Subject } from 'rxjs';
import { takeUntil, tap } from 'rxjs/operators';

@Directive({
  // eslint-disable-next-line @angular-eslint/directive-selector
  selector: 'p-dialog[focusable]'
})
export class DialogFocusDirective implements OnDestroy {
  unbindDialogClickListener!: any;

  destroy$ = new Subject();

  constructor(
    @Host() private dialog: Dialog,
    private renderer: Renderer2,
    @Inject(DOCUMENT) private document: Document
  ) {
    this.dialog.maskStyleClass =
      this.dialog.maskStyleClass + ' dialog-focusable';

    this.dialog.appendContainer = () => {
      if (this.dialog.appendTo) {
        if (this.dialog.appendTo === 'body') {
          this.renderer.appendChild(this.document.body, this.dialog.wrapper);
        } else
          DomHandler.appendChild(this.dialog.wrapper, this.dialog.appendTo);
      }
      this.setDialogPosition();
    };

    this.dialog.onShow
      .pipe(
        takeUntil(this.destroy$),
        tap(() => {
          if (this.dialog.container && !this.dialog.modal)
            this.unbindDialogClickListener = this.renderer.listen(
              this.dialog.container,
              'click',
              () => {
                if (!this.dialog.wrapper) return;

                let zIndex = this.dialog.wrapper.style.zIndex;

                // select the dialog array that needs to be updated
                const array: HTMLElement[] = [];
                document
                  .querySelectorAll<HTMLElement>(
                    '.p-dialog-mask.dialog-focusable'
                  )
                  .forEach(el => {
                    if (Number(el.style.zIndex) > Number(zIndex))
                      array.push(el);
                  });

                // sort the array
                array.sort((a, b) =>
                  Number(a.style.zIndex) > Number(b.style.zIndex) ? 1 : -1
                );

                // update z-index from min to max
                array.forEach(el => {
                  const temp = el.style.zIndex;
                  el.style.zIndex = zIndex;
                  zIndex = temp;
                });

                // zIndex now is the max
                this.dialog.wrapper.style.zIndex = zIndex;
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

  setDialogPosition() {
    if(!this.dialog.container) return;

    const array: HTMLElement[] = [];
    document
      .querySelectorAll<HTMLElement>('.dialog-focusable .p-dialog')
      .forEach(el => array.push(el));
    if (array.length <= 1) return;

    let offsetTop = array[0].offsetTop;
    let offsetLeft = array[0].offsetLeft;
    // eslint-disable-next-line no-constant-condition
    while (true) {
      if (
        array.find(
          el => el.offsetTop === offsetTop && el.offsetLeft === offsetLeft
        )
      ) {
        offsetLeft += 20;
        offsetTop += 20;
      } else break;
    }
    this.dialog.container.style.position = `fixed`;
    this.dialog.container.style.top = `${offsetTop}px`;
    this.dialog.container.style.left = `${offsetLeft}px`;
  }

  ngOnDestroy(): void {
    this.destroy$.next(null);
    this.destroy$.complete;
  }
}

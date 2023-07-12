import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GlobalLoadingService {
  loading$ = new Subject<boolean>();
  isStart = false;
  count = 0;
  callback: any;

  start() {
    this.count = 0;
    this.isStart = true;
    this.loading$.next(false);
  }

  add() {
    if (!this.isStart) return;
    if (this.callback) clearTimeout(this.callback);

    this.count += 1;
    if (this.count === 1) {
      setTimeout(() => {
        this.loading$.next(true);
      }, 0);
    }
  }

  remove() {
    if (!this.isStart) return;
    if (this.callback) clearTimeout(this.callback);

    this.count -= 1;
    this.callback = setTimeout(() => {
      if (this.count === 0) {
        this.isStart = false;
        this.loading$.next(false);
      }
    }, 100);
  }

  end() {
    this.count = 0;
    this.isStart = false;
    this.loading$.next(false);
  }
}

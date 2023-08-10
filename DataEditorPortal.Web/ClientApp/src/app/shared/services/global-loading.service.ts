import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GlobalLoadingService {
  loading$ = new Subject<boolean>();
  isStart = false;
  requestArr: number[] = [];
  callback: any;

  start() {
    this.requestArr = [];
    this.isStart = true;
    this.loading$.next(false);
  }

  add(timestep: number) {
    if (!this.isStart) return;
    if (this.callback) clearTimeout(this.callback);

    this.requestArr.push(timestep);
    if (this.requestArr.length === 1) {
      setTimeout(() => {
        this.loading$.next(true);
      }, 0);
    }
  }

  remove(timestep: number) {
    if (!this.isStart) return;
    if (this.callback) clearTimeout(this.callback);
    const index = this.requestArr.findIndex(x => x === timestep);
    if (index > -1) {
      this.requestArr.splice(index, 1);
    }

    this.callback = setTimeout(() => {
      if (this.requestArr.length === 0) {
        this.isStart = false;
        this.loading$.next(false);
      }
    }, 100);
  }

  end() {
    this.requestArr = [];
    this.isStart = false;
    this.loading$.next(false);
  }
}

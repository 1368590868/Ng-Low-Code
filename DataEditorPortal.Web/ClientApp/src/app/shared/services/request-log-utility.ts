import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RequestLogUtility {
  end$ = new Subject<number>();
  start$ = new Subject<number>();

  start(timestep: number) {
    this.start$.next(timestep);
  }

  end(timestep: number) {
    this.end$.next(timestep);
  }
}

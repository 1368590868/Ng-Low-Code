import { Injectable } from '@angular/core';
import { delay, of } from 'rxjs';

@Injectable()
export class EventActionHandlerService {
  excuteAction() {
    return of(true);
  }
}

@Injectable()
export class AddUserActionHandler extends EventActionHandlerService {
  override excuteAction() {
    return of(true);
  }
}

@Injectable()
export class EditUserActionHandler extends EventActionHandlerService {
  override excuteAction() {
    return of(false).pipe(delay(2000));
  }
}

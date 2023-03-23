import { Injectable } from '@angular/core';
import { delay, of, tap } from 'rxjs';
import { NotifyService } from 'src/app/shared';
type NotifyType =
  | 'notifySuccess'
  | 'notifyInfo'
  | 'notifyWarning'
  | 'notifyError';

@Injectable()
export class EventActionHandlerService {
  constructor(private notifyService: NotifyService) {}
  excuteAction() {
    return of(true);
  }

  notify(summary = '', message = '', type: NotifyType = 'notifySuccess') {
    this.notifyService[type](summary, message);
  }
}

@Injectable()
export class TrueOnValidateActionHandler extends EventActionHandlerService {
  override excuteAction() {
    return of(true).pipe(
      delay(1000),
      tap(() => {
        super.notify('True', 'Action excuted successfully');
      })
    );
  }
}

@Injectable()
export class FalseOnAfterActionHandler extends EventActionHandlerService {
  override excuteAction() {
    return of(false).pipe(
      delay(3000),
      tap(() => {
        super.notify('False', 'Action excuted successfully', 'notifyWarning');
      })
    );
  }
}

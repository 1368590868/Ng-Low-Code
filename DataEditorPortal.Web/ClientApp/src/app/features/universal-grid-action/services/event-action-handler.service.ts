import { Injectable } from '@angular/core';
import { delay, of, tap } from 'rxjs';
import { NotifyService } from 'src/app/shared';

@Injectable()
export class EventActionHandlerService {
  constructor(protected notifyService: NotifyService) {}
  excuteAction() {
    return of(true);
  }
}

@Injectable()
export class OnValidateDemoActionHandler extends EventActionHandlerService {
  override excuteAction() {
    return of(true).pipe(
      tap(() => {
        this.notifyService.notifyInfo('On Validate', 'Validation is running');
      }),
      delay(1000),
      tap(() => {
        this.notifyService.notifyInfo(
          'On Validate',
          'Validation excuted successfully'
        );
      })
    );
  }
}

@Injectable()
export class OnAfterSavedDemoActionHandler extends EventActionHandlerService {
  override excuteAction() {
    return of(false).pipe(
      delay(2000),
      tap(() => {
        this.notifyService.notifyInfo(
          'On After Saved',
          'Action excuted successfully'
        );
      })
    );
  }
}

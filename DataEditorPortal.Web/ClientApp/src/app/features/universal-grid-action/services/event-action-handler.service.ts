/* eslint-disable @typescript-eslint/no-unused-vars */
import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { delay, map, Observable, of, tap } from 'rxjs';
import { ApiResponse, NotifyService } from 'src/app/shared';
import { EditFormData } from '../models/edit';

export interface EventActionParam {
  name?: string;
  type?: 'ADD' | 'UPDATE' | 'DELETE';
  data?: EditFormData;
  id?: string;
  errorMsg?: string;
}

@Injectable()
export class EventActionHandlerService {
  constructor(protected notifyService: NotifyService) {}
  excuteAction() {
    return of(true);
  }
}

@Injectable()
export class AsyncQueryTextActionHandler extends EventActionHandlerService {
  public _apiUrl: string;
  constructor(
    private http: HttpClient,
    protected override notifyService: NotifyService,
    @Inject('API_URL') apiUrl: string
  ) {
    super(notifyService);
    this._apiUrl = apiUrl;
  }

  override excuteAction(params?: EventActionParam) {
    return this.http
      .post<ApiResponse<boolean>>(
        `${this._apiUrl}universal-grid/${params?.name}/data/${
          params?.type
        }/validate/${params?.id ?? ''}`,
        params?.data
      )
      .pipe(
        map(res => res.result || false),
        tap(res => {
          if (!res && params?.errorMsg)
            this.notifyService.notifyWarning('', params?.errorMsg);
        })
      );
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

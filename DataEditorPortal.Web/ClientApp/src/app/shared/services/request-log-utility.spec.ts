import { TestBed } from '@angular/core/testing';

import { RequestLogUtility } from './request-log-utility';

describe('RequestLogUtility', () => {
  let service: RequestLogUtility;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RequestLogUtility);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

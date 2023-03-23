import { TestBed } from '@angular/core/testing';

import { EventActionHandlerService } from './event-action-handler.service';

describe('EventActionHandlerService', () => {
  let service: EventActionHandlerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EventActionHandlerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

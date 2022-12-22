import { TestBed } from '@angular/core/testing';

import { WOService } from './WO.service';

describe('WOService', () => {
  let service: WOService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WOService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

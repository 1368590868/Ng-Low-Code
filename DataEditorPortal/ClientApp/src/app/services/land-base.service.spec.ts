import { TestBed } from '@angular/core/testing';

import { LandBaseService } from './land-base.service';

describe('LandBaseService', () => {
  let service: LandBaseService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LandBaseService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

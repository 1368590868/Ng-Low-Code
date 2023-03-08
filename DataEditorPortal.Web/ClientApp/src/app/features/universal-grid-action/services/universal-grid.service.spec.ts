import { TestBed } from '@angular/core/testing';

import { UniversalGridService } from './universal-grid.service';

describe('UniversalGridService', () => {
  let service: UniversalGridService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UniversalGridService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

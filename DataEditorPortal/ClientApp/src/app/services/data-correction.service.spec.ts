import { TestBed } from '@angular/core/testing';

import { DataCorrectionService } from './data-correction.service';

describe('DataCorrectionService', () => {
  let service: DataCorrectionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DataCorrectionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

import { TestBed } from '@angular/core/testing';

import { ImportActionService } from './import-action.service';

describe('ImportActionService', () => {
  let service: ImportActionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ImportActionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

import { TestBed } from '@angular/core/testing';

import { ExportActionService } from './export-action.service';

describe('ExportActionService', () => {
  let service: ExportActionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ExportActionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

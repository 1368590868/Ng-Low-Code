import { TestBed } from '@angular/core/testing';

import { DataDictionaryService } from './data-dictionary.service';

describe('PortalDictionaryService', () => {
  let service: DataDictionaryService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DataDictionaryService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

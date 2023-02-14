import { TestBed } from '@angular/core/testing';

import { PortalDictionaryService } from './portal-dictionary.service';

describe('PortalDictionaryService', () => {
  let service: PortalDictionaryService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PortalDictionaryService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

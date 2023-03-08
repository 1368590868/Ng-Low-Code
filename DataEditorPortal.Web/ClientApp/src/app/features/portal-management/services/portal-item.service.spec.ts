import { TestBed } from '@angular/core/testing';

import { PortalItemService } from './portal-item.service';

describe('PortalItemService', () => {
  let service: PortalItemService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PortalItemService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

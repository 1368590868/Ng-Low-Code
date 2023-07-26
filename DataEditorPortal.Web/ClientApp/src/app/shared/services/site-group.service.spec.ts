import { TestBed } from '@angular/core/testing';

import { SiteGroupService } from './site-group.service';

describe('SiteGroupService', () => {
  let service: SiteGroupService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SiteGroupService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

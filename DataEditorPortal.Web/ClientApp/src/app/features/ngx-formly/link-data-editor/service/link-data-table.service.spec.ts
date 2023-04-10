import { TestBed } from '@angular/core/testing';

import { LinkDataTableService } from './link-data-table.service';

describe('LinkDataTableService', () => {
  let service: LinkDataTableService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LinkDataTableService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

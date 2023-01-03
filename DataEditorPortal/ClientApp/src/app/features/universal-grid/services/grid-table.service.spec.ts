import { TestBed } from '@angular/core/testing';

import { GridTableService } from './grid-table.service';

describe('GridTableService', () => {
  let service: GridTableService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GridTableService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

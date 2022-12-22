import { TestBed } from '@angular/core/testing';

import { FilenetwoService } from './filenetwo.service';

describe('FilenetwoService', () => {
  let service: FilenetwoService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FilenetwoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

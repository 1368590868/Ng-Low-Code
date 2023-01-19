import { TestBed } from '@angular/core/testing';

import { NgxFormlyService } from './ngx-formly.service';

describe('NgxFormService', () => {
  let service: NgxFormlyService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NgxFormlyService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

import { TestBed } from '@angular/core/testing';

import { RemoveActionService } from './remove-action.service';

describe('RemoveActionService', () => {
  let service: RemoveActionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RemoveActionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

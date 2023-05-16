import { TestBed } from '@angular/core/testing';

import { LocationEditorService } from './location-editor.service';

describe('LocationEditorService', () => {
  let service: LocationEditorService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LocationEditorService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

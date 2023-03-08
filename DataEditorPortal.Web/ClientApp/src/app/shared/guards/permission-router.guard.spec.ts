import { TestBed } from '@angular/core/testing';

import { PermissionRouterGuard } from './permission-router.guard';

describe('PermissionRouterGuard', () => {
  let guard: PermissionRouterGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    guard = TestBed.inject(PermissionRouterGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});

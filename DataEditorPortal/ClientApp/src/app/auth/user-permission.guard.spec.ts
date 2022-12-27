import { TestBed } from '@angular/core/testing';

import { UserPermissionGuard } from './user-permission.guard';

describe('UserPermissionGuard', () => {
  let guard: UserPermissionGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    guard = TestBed.inject(UserPermissionGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});

import { TestBed } from '@angular/core/testing';

import { WinAuthInterceptor } from './win-auth.interceptor';

describe('WinAuthInterceptor', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      providers: [WinAuthInterceptor]
    })
  );

  it('should be created', () => {
    const interceptor: WinAuthInterceptor = TestBed.inject(WinAuthInterceptor);
    expect(interceptor).toBeTruthy();
  });
});

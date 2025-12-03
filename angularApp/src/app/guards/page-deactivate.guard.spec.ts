import { TestBed } from '@angular/core/testing';
import { CanDeactivateFn } from '@angular/router';

import { pageDeactivateGuard } from './page-deactivate.guard';

describe('pageDeactivateGuard', () => {
  const executeGuard: CanDeactivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => pageDeactivateGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});

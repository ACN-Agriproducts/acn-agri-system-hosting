import { TestBed } from '@angular/core/testing';

import { LoadOrderServiceService } from './load-order-service.service';

describe('LoadOrderServiceService', () => {
  let service: LoadOrderServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LoadOrderServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

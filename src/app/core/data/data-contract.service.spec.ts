import { TestBed } from '@angular/core/testing';

import { DataContractService } from './data-contract.service';

describe('DataContractService', () => {
  let service: DataContractService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DataContractService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

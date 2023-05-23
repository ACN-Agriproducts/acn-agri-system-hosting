import { TestBed } from '@angular/core/testing';

import { PrintableContractUtilitiesService } from './printable-contract-utilities.service';

describe('PrintableContractUtilitiesService', () => {
  let service: PrintableContractUtilitiesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PrintableContractUtilitiesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

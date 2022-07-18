import { TestBed } from '@angular/core/testing';

import { UniqueWarehouseReceiptIdService } from './unique-warehouse-receipt-id.service';

describe('UniqueWarehouseReceiptIdService', () => {
  let service: UniqueWarehouseReceiptIdService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UniqueWarehouseReceiptIdService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

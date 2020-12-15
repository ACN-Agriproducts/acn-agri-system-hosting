import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OptionNewInvoiceComponent } from './option-new-invoice.component';

describe('OptionNewInvoiceComponent', () => {
  let component: OptionNewInvoiceComponent;
  let fixture: ComponentFixture<OptionNewInvoiceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OptionNewInvoiceComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OptionNewInvoiceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FileInvoiceComponent } from './file-invoice.component';

describe('FileInvoiceComponent', () => {
  let component: FileInvoiceComponent;
  let fixture: ComponentFixture<FileInvoiceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FileInvoiceComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FileInvoiceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

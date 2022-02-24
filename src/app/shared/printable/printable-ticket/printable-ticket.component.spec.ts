import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrintableTicketComponent } from './printable-ticket.component';

describe('PrintableTicketComponent', () => {
  let component: PrintableTicketComponent;
  let fixture: ComponentFixture<PrintableTicketComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PrintableTicketComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PrintableTicketComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

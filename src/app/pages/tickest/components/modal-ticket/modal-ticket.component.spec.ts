import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalTicketComponent } from './modal-ticket.component';

describe('ModalTicketComponent', () => {
  let component: ModalTicketComponent;
  let fixture: ComponentFixture<ModalTicketComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ModalTicketComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalTicketComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

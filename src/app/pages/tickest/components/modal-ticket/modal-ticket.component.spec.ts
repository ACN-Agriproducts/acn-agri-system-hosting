import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ModalTicketComponent } from './modal-ticket.component';

describe('ModalTicketComponent', () => {
  let component: ModalTicketComponent;
  let fixture: ComponentFixture<ModalTicketComponent>;

  beforeEach(waitForAsync(() => {
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

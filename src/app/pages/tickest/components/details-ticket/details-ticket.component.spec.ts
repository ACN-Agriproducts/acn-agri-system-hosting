import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { DetailsTicketComponent } from './details-ticket.component';

describe('DetailsTicketComponent', () => {
  let component: DetailsTicketComponent;
  let fixture: ComponentFixture<DetailsTicketComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ DetailsTicketComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DetailsTicketComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

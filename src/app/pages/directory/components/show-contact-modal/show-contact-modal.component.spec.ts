import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ShowContactModalComponent } from './show-contact-modal.component';

describe('ShowContactModalComponent', () => {
  let component: ShowContactModalComponent;
  let fixture: ComponentFixture<ShowContactModalComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ShowContactModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ShowContactModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

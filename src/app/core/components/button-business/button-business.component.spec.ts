import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ButtonBusinessComponent } from './button-business.component';

describe('ButtonBusinessComponent', () => {
  let component: ButtonBusinessComponent;
  let fixture: ComponentFixture<ButtonBusinessComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ButtonBusinessComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ButtonBusinessComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

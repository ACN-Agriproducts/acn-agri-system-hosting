import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { OptionBusinessComponent } from './option-business.component';

describe('OptionBusinessComponent', () => {
  let component: OptionBusinessComponent;
  let fixture: ComponentFixture<OptionBusinessComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ OptionBusinessComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OptionBusinessComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

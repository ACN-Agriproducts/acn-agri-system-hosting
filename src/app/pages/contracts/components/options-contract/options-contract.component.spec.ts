import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { OptionsContractComponent } from './options-contract.component';

describe('OptionsContractComponent', () => {
  let component: OptionsContractComponent;
  let fixture: ComponentFixture<OptionsContractComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ OptionsContractComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OptionsContractComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OptionsContractComponent } from './options-contract.component';

describe('OptionsContractComponent', () => {
  let component: OptionsContractComponent;
  let fixture: ComponentFixture<OptionsContractComponent>;

  beforeEach(async(() => {
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

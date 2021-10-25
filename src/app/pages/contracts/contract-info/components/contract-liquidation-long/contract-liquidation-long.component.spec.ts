import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { ContractLiquidationLongComponent } from './contract-liquidation-long.component';

describe('ContractLiquidationLongComponent', () => {
  let component: ContractLiquidationLongComponent;
  let fixture: ComponentFixture<ContractLiquidationLongComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ContractLiquidationLongComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(ContractLiquidationLongComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

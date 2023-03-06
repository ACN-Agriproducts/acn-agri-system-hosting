import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { PurchaseUnfixedPriceComponent } from './purchase-unfixed-price.component';

describe('PurchaseUnfixedPriceComponent', () => {
  let component: PurchaseUnfixedPriceComponent;
  let fixture: ComponentFixture<PurchaseUnfixedPriceComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ PurchaseUnfixedPriceComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(PurchaseUnfixedPriceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

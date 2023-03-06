import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { SalesUnfixedPriceComponent } from './sales-unfixed-price.component';

describe('SalesUnfixedPriceComponent', () => {
  let component: SalesUnfixedPriceComponent;
  let fixture: ComponentFixture<SalesUnfixedPriceComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ SalesUnfixedPriceComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(SalesUnfixedPriceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

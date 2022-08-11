import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { WarehouseReceiptGroupCardComponent } from './warehouse-receipt-group-card.component';

describe('WarehouseReceiptGroupCardComponent', () => {
  let component: WarehouseReceiptGroupCardComponent;
  let fixture: ComponentFixture<WarehouseReceiptGroupCardComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ WarehouseReceiptGroupCardComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(WarehouseReceiptGroupCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
